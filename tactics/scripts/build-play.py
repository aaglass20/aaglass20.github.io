#!/usr/bin/env python3
"""Build a tactics-board play file from a short drill spec.

    python3 tactics/scripts/build-play.py tactics/plays/specs/50-touches.json

writes tactics/plays/50-touches.json (or the spec's "out"). Open it in the board with 📂 Open.
See tactics/DRILL-TO-PLAY.md for the spec format and how to draw a drill from its text.
"""
import datetime
import json
import os
import sys

# Field canvases (field coordinates, before the board's padding), from canvasFor() in App.jsx
CANVAS = {
    'blank': (840, 544), 'horizontal': (840, 544), 'half': (840, 544), 'half-flip': (840, 544),
    'middle': (840, 544), 'horizontal-left': (440, 544), 'horizontal-right': (440, 544), 'full': (544, 840),
}

COLORS = {   # OBJECT_COLORS / DRAW_COLORS names → hex
    'blue': '#3b82f6', 'yellow': '#facc15', 'red': '#ef4444', 'green': '#22c55e', 'orange': '#f97316',
    'purple': '#a855f7', 'white': '#ffffff', 'black': '#000000', 'gray': '#6b7280', 'lightgreen': '#86efac',
}

DEFAULT_SIZE = {'player': 4, 'player-t1': 4, 'player-t2': 4, 'pos-t1': 4, 'pos-t2': 4, 'cone': 2, 'ball': 2,
                'goal': 4, 'popup-goal': 3, 'freekick': 3, 'arch': 3}
DEFAULT_COLOR = {'player': '#3b82f6', 'player-t1': '#3b82f6', 'player-t2': '#facc15', 'marker': '#3b82f6',
                 'marker2': '#facc15', 'cone': '#f97316', 'ball': '#f9fafb', 'goal': '#f9fafb',
                 'popup-goal': '#f97316', 'pinnie': '#ef4444', 'pole': '#facc15', 'hoop': '#3b82f6'}
MODEL_TYPES = {'goal', 'popup-goal', 'freekick', 'arch', 'fieldgoal', 'hockey-goal', 'hit-net'}
TEXT_BG = {'none': 'transparent', 'dark': 'rgba(0,0,0,0.55)', 'navy': 'rgba(0,20,60,0.6)', 'frost': 'rgba(255,255,255,0.15)'}


def color(c, fallback):
    if c is None:
        return fallback
    return COLORS.get(c, c)


def build(spec):
    field = spec.get('field', 'blank')
    W, H = CANVAS[field]
    pt = lambda p: {'x': round(max(0, min(W, p[0]))), 'y': round(max(0, min(H, p[1])))}

    # Objects: key → id
    objects, ids = [], {}
    for o in spec['objects']:
        t = o['type']
        obj = {'id': len(objects), 'type': t, 'size': o.get('size', DEFAULT_SIZE.get(t, 3)), 'rotation': o.get('rotation', 0)}
        c = color(o.get('color'), DEFAULT_COLOR.get(t))
        if c:
            obj['color'] = c
        if 'label' in o:   # jersey / marker label: a number or a letter
            obj['number'] = o['label']
        if t in MODEL_TYPES:
            obj['facing'] = o.get('facing', 180)
        if o.get('locked'):
            obj['locked'] = True
        ids[o['key']] = obj['id']
        objects.append(obj)

    # Frames: positions carry forward; each frame lists only what moves ("at")
    texts, frames, pos = [], [], {}
    caption_id = None
    if any('caption' in f for f in spec['frames']):
        caption_id = 1 if spec.get('title') else 0
    for i, f in enumerate(spec['frames']):
        for key, p in f.get('at', {}).items():
            pos[str(ids[key])] = pt(p)
        frame = {'positions': dict(pos)}
        if 'speed' in f:
            frame['speed'] = f['speed']
        if i > 0 and 'caption' in f:
            frame['texts'] = {str(caption_id): {'text': f['caption'], 'hidden': False}}
        frames.append(frame)
    missing = [o['key'] for o in spec['objects'] if str(ids[o['key']]) not in frames[0]['positions']]
    if missing:
        sys.exit(f'Frame 1 needs a position for: {", ".join(missing)}')

    # Text: title (top), caption (bottom, changes per frame), extra labels. The board fits widths
    # on open; anchor "center" means x is the label's middle.
    def label(x, y, text, size=18, style='normal', fill='white', bg='none', transition='none', anchor='center'):
        item = {'id': len(texts), 'x': round(x), 'y': round(y), 'text': text, 'fontSize': size, 'fontStyle': style,
                'fill': color(fill, '#ffffff'), 'background': TEXT_BG.get(bg, bg), 'transition': transition}
        if anchor == 'center':
            item['anchor'] = 'center'
        texts.append(item)

    if spec.get('title'):
        label(W / 2, 28, spec['title'], size=26, style='bold', bg='navy')
    if caption_id is not None:
        label(W / 2, H - 96, spec['frames'][0].get('caption', ''), size=18, bg='dark', transition=spec.get('captionTransition', 'type'))
    for l in spec.get('labels', []):
        label(l['at'][0], l['at'][1], l['text'], l.get('size', 14), l.get('style', 'italic'), l.get('color', 'white'),
              l.get('bg', 'none'), l.get('transition', 'none'), l.get('anchor', 'center'))

    # Arrows (static, shown on every frame)
    drawings = []
    for a in spec.get('arrows', []):
        p1, p2 = pt(a['from']), pt(a['to'])
        drawings.append({'id': len(drawings), 'type': a.get('kind', 'arrow'), 'mode': 'straight',
                         'color': color(a.get('color'), '#ffffff'), 'thickness': a.get('thickness', 3),
                         'points': [p1['x'], p1['y'], p2['x'], p2['y']]})

    return {
        'format': 'tactics-board', 'version': 1,
        'savedAt': datetime.datetime.now().isoformat(timespec='seconds'),
        'sport': spec.get('sport', 'soccer'), 'field': field, 'playSpeed': spec.get('speed', 0.75),
        'placedObjects': objects, 'frames': frames, 'freePaths': {}, 'drawings': drawings, 'shapes': [],
        'textItems': texts,
        'nextIds': {'object': len(objects), 'draw': len(drawings), 'shape': 0, 'text': len(texts)},
        'notes': {**spec.get('notes', {}), 'source': 'Drawn by Claude from the drill text'},
    }


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    spec_path = sys.argv[1]
    spec = json.load(open(spec_path))
    play = build(spec)
    out = spec.get('out') or os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(spec_path))),
                                          os.path.splitext(os.path.basename(spec_path))[0] + '.json')
    with open(out, 'w') as f:
        json.dump(play, f, indent=2, ensure_ascii=False)
    print(f'Wrote {out}: {len(play["placedObjects"])} objects, {len(play["frames"])} frames, '
          f'{len(play["drawings"])} arrows, {len(play["textItems"])} labels')


if __name__ == '__main__':
    main()
