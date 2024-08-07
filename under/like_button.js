'use strict';

const e = React.createElement;

class LikeButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {liked: false};
  }

  render() {
    if (this.state.liked) {
      return 'You liked this.';
    }

    return e(
        'button',
        {onClick: () => this.setState({liked: true})},
        'Like'
    );
  }
}

// Find all DOM containers, and render Like buttons into them.
document.querySelectorAll('.like_button_container')
    .forEach(domContainer => {
      // Read the comment ID from a data-* attribute.
      const testID = parseInt(domContainer.dataset.testID, 10);
      ReactDOM.render(
          e(LikeButton, { testID: testID }),
          domContainer
      );
    });