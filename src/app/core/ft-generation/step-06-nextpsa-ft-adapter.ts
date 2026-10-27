import {
  GeneratedFaultTreeLink,
  GeneratedFaultTreeModel,
  GeneratedFaultTreeNode,
  LogicExpression,
  UndesiredEvent
} from './ft-generation.models';

interface BuildContext {
  nodes: GeneratedFaultTreeNode[];
  links: GeneratedFaultTreeLink[];
  nodeCounter: number;
  linkCounter: number;
  gateCounter: number;
}

function nextNodeKey(context: BuildContext, prefix: string): string {
  context.nodeCounter += 1;
  return `${prefix}-${String(context.nodeCounter).padStart(4, '0')}`;
}

function nextGateId(context: BuildContext): string {
  context.gateCounter += 1;
  return `AUTO-GATE-${String(context.gateCounter).padStart(4, '0')}`;
}

function appendExpression(
  expression: LogicExpression,
  parentKey: string,
  context: BuildContext,
  siblingOrder: number
): void {
  if (expression.kind === 'TRUE' || expression.kind === 'FALSE' || expression.kind === 'AVAILABILITY') {
    return;
  }

  let child: GeneratedFaultTreeNode;

  if (expression.kind === 'FAILURE_EVENT') {
    child = {
      key: nextNodeKey(context, 'EV'),
      category: expression.atom.category,
      id: expression.atom.eventId,
      description: expression.atom.description,
      state: 'NORMAL',
      recordType:
        expression.atom.category === 'BASIC_EVENT'
          ? 'BEV'
          : expression.atom.category === 'HOUSE_EVENT'
            ? 'HEV'
            : 'FTR',
      siblingOrder
    };
  } else {
    child = {
      key: nextNodeKey(context, 'G'),
      category: 'GATE',
      id: nextGateId(context),
      description: `Generated ${expression.kind} gate`,
      state: 'NORMAL',
      gateType: expression.kind,
      recordType: 'GAT',
      siblingOrder
    };
  }

  context.nodes.push(child);
  context.linkCounter += 1;
  context.links.push({
    key: `L-${String(context.linkCounter).padStart(4, '0')}`,
    from: parentKey,
    to: child.key,
    fromPort: 'OUT',
    toPort: 'IN'
  });

  if (expression.kind === 'AND' || expression.kind === 'OR') {
    expression.children.forEach((grandChild, index) =>
      appendExpression(grandChild, child.key, context, index)
    );
  }
}

export function toNextPsaFaultTree(
  undesiredEvent: UndesiredEvent,
  failureLogic: LogicExpression
): GeneratedFaultTreeModel {
  const context: BuildContext = {
    nodes: [],
    links: [],
    nodeCounter: 0,
    linkCounter: 0,
    gateCounter: 0
  };

  const rootGateType =
    failureLogic.kind === 'AND' || failureLogic.kind === 'OR'
      ? failureLogic.kind
      : 'OR';

  const top: GeneratedFaultTreeNode = {
    key: 'TOP-0001',
    category: 'TOP_EVENT',
    id: undesiredEvent.id,
    description: undesiredEvent.name,
    state: 'NORMAL',
    gateType: rootGateType,
    recordType: 'GAT'
  };

  context.nodes.push(top);

  if (failureLogic.kind === 'AND' || failureLogic.kind === 'OR') {
    failureLogic.children.forEach((child, index) =>
      appendExpression(child, top.key, context, index)
    );
  } else {
    appendExpression(failureLogic, top.key, context, 0);
  }

  return {
    id: `FT-${undesiredEvent.id}`,
    description: `Generated FT — ${undesiredEvent.name}`,
    topGateId: undesiredEvent.id,
    nodes: context.nodes,
    links: context.links
  };
}
