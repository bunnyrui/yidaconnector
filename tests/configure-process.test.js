'use strict';

const { _private } = require('../lib/process/configure-process');

function getApprovalNodes(result) {
  return result.processJson.nodes.filter(function (node) {
    return node.type === 'approval';
  });
}

function getViewApprovalNode(result) {
  return result.viewJson.schema.children.find(function (node) {
    return node.componentName === 'ApprovalNode';
  });
}

describe('configure-process approver DSL', () => {
  test('builds specified member approver from users', () => {
    const result = _private.buildProcessAndViewJson({
      nodes: [
        {
          type: 'approval',
          name: '主管审批',
          approver: {
            type: 'user',
            users: [{ id: 'manager7350', name: '九神' }],
          },
        },
      ],
    }, 'TPROC-TEST', 'FORM-TEST', 'https://www.aliwork.com', 'APP_TEST');

    const approvalNode = getApprovalNodes(result)[0];
    expect(approvalNode.approvalType).toBe('ext_target_approval');
    expect(approvalNode.props.approvals).toEqual(['manager7350']);
    expect(approvalNode.props.multiApprove).toBe('all');

    const approverRules = getViewApprovalNode(result).props.approverRules;
    expect(approverRules.type).toBe('ext_target_approval');
    expect(approverRules.approvals).toEqual([
      {
        id: 'manager7350',
        label: '九神',
        type: 'employee',
        roleType: 'DINGTALK',
      },
    ]);
    expect(approverRules.description).toBe('九神');
  });

  test('builds role approver with multiRoles grouped by roleType', () => {
    const result = _private.buildProcessAndViewJson({
      nodes: [
        {
          type: 'approval',
          name: '财务审批',
          approver: {
            type: 'role',
            roles: [
              { id: 'ROLE-FINANCE', label: '财务', roleType: 'YIDA' },
              { id: 'ROLE-DING', label: '钉钉角色', roleType: 'DINGTALK' },
            ],
            multiApproverType: 'or',
          },
        },
      ],
    }, 'TPROC-TEST', 'FORM-TEST', 'https://www.aliwork.com', 'APP_TEST');

    const approvalNode = getApprovalNodes(result)[0];
    expect(approvalNode.approvalType).toBe('ext_target_approval_role');
    expect(approvalNode.props.approvals).toBeUndefined();
    expect(approvalNode.props.multiApprove).toBe('or');
    expect(approvalNode.props.multiRoles).toEqual([
      { roleId: ['ROLE-FINANCE'], roleExtType: 'YIDA' },
      { roleId: ['ROLE-DING'], roleExtType: 'DINGTALK' },
    ]);

    const approverRules = getViewApprovalNode(result).props.approverRules;
    expect(approverRules.type).toBe('ext_target_approval_role');
    expect(approverRules.approvalType_ext_target_approval_role).toBe('or');
    expect(approverRules.roles[0]).toEqual({
      id: 'ROLE-FINANCE',
      label: '财务',
      type: 'role',
      roleType: 'YIDA',
    });
  });

  test('builds department leader approver from originator source', () => {
    const result = _private.buildProcessAndViewJson({
      nodes: [
        {
          type: 'approval',
          name: '部门主管审批',
          approver: {
            type: 'deptLeader',
            source: 'originator',
            level: 2,
            needLeaderReplace: true,
            ignoreNoLeaderDept: false,
          },
        },
      ],
    }, 'TPROC-TEST', 'FORM-TEST', 'https://www.aliwork.com', 'APP_TEST');

    const approvalNode = getApprovalNodes(result)[0];
    expect(approvalNode.approvalType).toBe('ext_target_dept_leader');
    expect(approvalNode.props.approvals).toBeUndefined();
    expect(approvalNode.props).toMatchObject({
      key: 'DeptLeaderApproverRule_1.0.0',
      userIdVar: 'originator',
      reportLevel: 2,
      ignoreNoLeaderDept: 'false',
      needLeaderReplace: 'true',
      multiApprove: 'all',
    });

    const approverRules = getViewApprovalNode(result).props.approverRules;
    expect(approverRules.type).toBe('ext_target_dept_leader');
    expect(approverRules.supervisorType).toEqual({ value: 'originator', label: '发起人' });
    expect(approverRules.supervisorLevel).toBe('2');
    expect(approverRules.description).toBe('发起人的第2级主管');
  });
});
