// Balance — Supabase config
// Same project as /schedule/, /empower/, /fuelup/, /wip/
// Run balance/setup.sql once (edit the member emails first).

window.BALANCE_CONFIG = {
  SUPABASE_URL:      'https://fpnmnlrwhwnuefbnehuf.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_NXTAP09deRk87WsP_KdyXg_e1k2Dsih',
  ACTION_HORIZON_DAYS: 30,   // dashboard "Action needed" looks this far ahead
  UNUSED_DAYS: 45,           // flag a subscription not used in this many days
  STREAMING_STACK_LIMIT: 2,  // more active streaming services than this → "rotate?"
};
