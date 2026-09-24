import { html } from '@src/mail/application/html.js';

describe('html', () => {
  it('escapes inserted values but not nested html', () => {
    const name = '<script>"x"</script>';
    expect(html`<p>${name}</p>${html`<b>${1}</b>`}`.value).toBe(
      '<p>&lt;script&gt;&quot;x&quot;&lt;/script&gt;</p><b>1</b>',
    );
  });
});
