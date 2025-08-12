/* eslint-disable import/no-extraneous-dependencies */

import { expect, fixture, html } from '@open-wc/testing';
import { sendMouse } from '@web/test-runner-commands';

import { visualDiff } from '@web/test-runner-visual-regression';

import './action-tree.js';
import type { ActionTree } from './ActionTree.js';

const factor = window.process && process.env.CI ? 6 : 3;
function timeout(ms: number) {
  return new Promise(res => {
    setTimeout(res, ms * factor);
  });
}
mocha.timeout(4000 * factor);

document.body.style.width = '800px';

const testTree = {
  name: 'IED1',
  children: [{
    name: 'LD1',
    children: [
      {
        name: 'LLN0',
        children: [
          {
            name: 'Beh',
            leaf: [{ val: 0 }, { edit: () => { window.alert("SomeAlert") }, val: 1 }, { val: 4 }],
          }
        ]
      },
      {
        name: 'MMXU1',
        info: 'This is a logical node for measurement',
        children: [
          {
            name: 'A',
            children: [
              {
                name: 'phsA',
                leaf: [{ val: 33.44 }, { val: 55.4483482345 }, { val: 66.44 }],
              },
              {
                name: 'phsB',
                leaf: [{ val: 22.44 }, { val: 66.44 }, { val: 77.44 }],
              },
              {
                name: 'phsC',
                leaf: [{ val: 11.44 }, { val: 33.44 }, { val: 55.44 }],
              }
            ]
          }
        ]
      }
    ]
  }, {
    name: 'LD2',
    children: [
      {
        name: 'LLN0',
        children: [
          {
            name: 'Beh',
            leaf: [{ val: 0 }],
          }
        ]
      },
      {
        name: 'MMXU1',
        children: [
          {
            name: 'A',
            children: [
              {
                name: 'phsA',
                leaf: [{ val: 33.44 }, { val: 55.44 }, { val: 66.44 }],
              },
              {
                name: 'phsB',
                leaf: [{ val: 22.44 }, { val: 66.44 }, { val: 77.44 }],
              },
              {
                name: 'phsC',
                leaf: [{ val: 11.44 }, { val: 33.44 }, { val: 55.44 }],
              }
            ]
          }
        ]
      }
    ]
  }, {
    name: 'LD3',
    children: []
  }]
};


describe('Custom List component ActionTree', () => {
  describe('without actions', () => {
    let list: ActionTree;

    beforeEach(async () => {
      list = await fixture(
        html`<action-tree .data=${testTree}></action-tree>`
      );
      document.body.prepend(list);
    });

    afterEach(() => {
      if (list) list.remove();
    });

    it('looks like the last screenshot', async () => {
      await timeout(200);
      await visualDiff(list, `action-tree/folded per default`);
    });
  });

  describe('completely unfolded', () => {
    let list: ActionTree;

    beforeEach(async () => {
      list = await fixture(
        html`<action-tree .data=${testTree}></action-tree>`
      );
      document.body.prepend(list);
      await timeout(200);
    });

    afterEach(() => {
      if (list) list.remove();
    });

    it('unfolds all nodes systematically by finding visible fold icons', async () => {
      // Alternative approach: systematically find and click all visible fold icons
      let foundFoldableIcon = true;
      let iterations = 0;
      const maxIterations = 20; // Safety limit

      while (foundFoldableIcon && iterations < maxIterations) {
        foundFoldableIcon = false;
        iterations += 1;

        // Find all currently visible, non-folded fold icons
        const visibleRows = list.shadowRoot?.querySelectorAll('.tree-row:not(.child-hidden)');

        if (visibleRows) {
          // eslint-disable-next-line no-restricted-syntax
          for (const row of Array.from(visibleRows)) {
            const foldIcon = row.querySelector('.tree-fold');

            // Check if this is a foldable icon (currently folded and can be expanded)
            if (foldIcon &&
              foldIcon.classList.contains('folded') &&
              foldIcon.textContent?.trim() === '⌃') {

              // Calculate click position
              const rect = foldIcon.getBoundingClientRect();
              const x = Math.round(rect.left + rect.width / 2);
              const y = Math.round(rect.top + rect.height / 2);

              // Click the fold icon
              // eslint-disable-next-line no-await-in-loop
              await sendMouse({ type: 'click', position: [x, y] });
              // eslint-disable-next-line no-await-in-loop
              await timeout(150); // Wait for animation

              foundFoldableIcon = true;
              break; // Start over to find newly visible icons
            }
          }
        }
      }

      // Wait for final animations
      await timeout(300);

      // Take visual diff
      await visualDiff(list, `action-tree/systematically-unfolded`);
    });
  });
}); 
