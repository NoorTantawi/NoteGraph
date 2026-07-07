import { useEffect, type RefObject } from 'react';

export function useScrollSync(
  sourceRef: RefObject<HTMLElement | null>,
  targetRef: RefObject<HTMLElement | null>
) {
  useEffect(() => {
    const source = sourceRef.current;
    const target = targetRef.current;

    if (!source || !target) return;

    let isSyncingLeft = false;
    let isSyncingRight = false;

    const handleSourceScroll = () => {
      if (!isSyncingLeft) {
        isSyncingRight = true;
        const percentage =
          source.scrollTop / (source.scrollHeight - source.clientHeight);
        target.scrollTop = percentage * (target.scrollHeight - target.clientHeight);
      }
      isSyncingLeft = false;
    };

    const handleTargetScroll = () => {
      if (!isSyncingRight) {
        isSyncingLeft = true;
        const percentage =
          target.scrollTop / (target.scrollHeight - target.clientHeight);
        source.scrollTop = percentage * (source.scrollHeight - source.clientHeight);
      }
      isSyncingRight = false;
    };

    // The source in this case is actually the CodeMirror editor container, but CodeMirror manages its own scroll container
    // We'll attach to the actual `.cm-scroller` inside the source.
    let cmScroller: Element | null = null;
    
    // We use a MutationObserver to wait for CodeMirror to mount its scroller
    const observer = new MutationObserver(() => {
      if (!cmScroller && source.querySelector('.cm-scroller')) {
        cmScroller = source.querySelector('.cm-scroller');
        cmScroller?.addEventListener('scroll', handleSourceScroll);
      }
    });
    
    observer.observe(source, { childList: true, subtree: true });

    // Try finding it immediately in case it's already there
    cmScroller = source.querySelector('.cm-scroller');
    if (cmScroller) {
      cmScroller.addEventListener('scroll', handleSourceScroll);
    }

    target.addEventListener('scroll', handleTargetScroll);

    return () => {
      observer.disconnect();
      if (cmScroller) {
        cmScroller.removeEventListener('scroll', handleSourceScroll);
      }
      target.removeEventListener('scroll', handleTargetScroll);
    };
  }, [sourceRef, targetRef]);
}
