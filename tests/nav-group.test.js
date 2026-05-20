'use strict';

const {
  ROOT_NAV_UUID,
  buildNavigationTree,
  flattenTreeIds,
  moveNodeInTree,
  parseArgs,
  resolveNode,
} = require('../lib/app/nav-group');

const fixture = [
  { id: 1, navUuid: 'NAV-SYSTEM-RUNNING-UUID', parentNavUuid: ROOT_NAV_UUID, navType: 'SYSTEM', title: { zh_CN: '待我处理' }, listOrder: 0 },
  { id: 2, navUuid: 'FORM-A', formUuid: 'FORM-A', parentNavUuid: ROOT_NAV_UUID, navType: 'PAGE', title: { zh_CN: '表单 A' }, listOrder: 1 },
  { id: 3, navUuid: 'NAV-GROUP-1', parentNavUuid: ROOT_NAV_UUID, navType: 'NAV', title: { zh_CN: '分组一', en_US: 'Group One' }, listOrder: 2 },
  { id: 4, navUuid: 'FORM-B', formUuid: 'FORM-B', parentNavUuid: 'NAV-GROUP-1', navType: 'PAGE', title: { zh_CN: '表单 B' }, listOrder: 3 },
  { id: 5, navUuid: 'NAV-GROUP-2', parentNavUuid: ROOT_NAV_UUID, navType: 'NAV', title: { zh_CN: '分组二' }, listOrder: 4 },
];

describe('nav-group helpers', () => {
  test('parseArgs separates positionals and flags', () => {
    expect(parseArgs(['APP_XXX', 'FORM-A', '--to', '分组一', '--after', 'FORM-B', '--force'])).toEqual({
      positional: ['APP_XXX', 'FORM-A'],
      flags: {
        to: '分组一',
        after: 'FORM-B',
        force: true,
      },
    });
  });

  test('buildNavigationTree returns groups and pages without system nodes by default', () => {
    const tree = buildNavigationTree(fixture);

    expect(tree.map((node) => node.name)).toEqual(['表单 A', '分组一', '分组二']);
    expect(tree[1]).toMatchObject({
      navUuid: 'NAV-GROUP-1',
      type: 'group',
      childrenCount: 1,
    });
    expect(tree[1].children[0]).toMatchObject({
      navUuid: 'FORM-B',
      type: 'page',
    });
  });

  test('resolveNode resolves by navUuid, formUuid, and display name', () => {
    expect(resolveNode(fixture, 'FORM-A').navUuid).toBe('FORM-A');
    expect(resolveNode(fixture, '分组一', { groupOnly: true }).navUuid).toBe('NAV-GROUP-1');
    expect(resolveNode(fixture, 'root').navUuid).toBe(ROOT_NAV_UUID);
  });

  test('moveNodeInTree moves a page into a target group and returns flattened ids', () => {
    const moved = moveNodeInTree(fixture, 'FORM-A', 'NAV-GROUP-2');
    const flatNodes = [];
    const walk = (nodes) => nodes.forEach((node) => {
      flatNodes.push([node.navUuid, node.parentNavUuid]);
      walk(node.children || []);
    });
    walk(moved.roots);

    expect(flatNodes).toContainEqual(['FORM-A', 'NAV-GROUP-2']);
    expect(flattenTreeIds(moved.roots)).toEqual([1, 3, 4, 5, 2]);
    expect(moved.ids).toEqual([1, 3, 4, 5, 2]);
  });

  test('moveNodeInTree rejects moving a system node', () => {
    expect(() => moveNodeInTree(fixture, 'NAV-SYSTEM-RUNNING-UUID', ROOT_NAV_UUID))
      .toThrow('System navigation nodes cannot be moved');
  });
});
