import type { ReactNode } from 'react'

import { ART_RIGHTS, FAN_CONTENT_POLICY_URL, NOTICE_LEAD, NOTICE_REST, POLICY_NAME } from './notice.ts'
import './legal.css'

/**
 * The Fan Content Policy notice, as a quiet footer line — on the landing
 * page, the library and the deck builder — with a link to the About page's
 * fuller notices. `children` goes first, on a line of its own: the landing
 * page's credit for its hero art.
 */
export function SiteNotice({ children }: { readonly children?: ReactNode }) {
  return (
    <footer className="site-notice">
      {children !== undefined ? <p className="site-notice-credit">{children}</p> : null}
      <p>
        {NOTICE_LEAD}{' '}
        <a href={FAN_CONTENT_POLICY_URL} target="_blank" rel="noreferrer">
          {POLICY_NAME}
        </a>
        . {NOTICE_REST} {ART_RIGHTS}{' '}
        <a href="/about">About &amp; legal</a>
      </p>
    </footer>
  )
}
