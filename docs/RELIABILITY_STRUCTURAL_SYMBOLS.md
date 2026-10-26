# NexusPSA reliability structural symbols

This catalogue prepares the Hydraulic, Electrical, I&C and HVAC workspaces for a future automatic fault-tree / AD generation engine inspired by knowledge-base modelling.

## Common semantic fields

Every structural palette object carries:
- `kbClass`: domain knowledge-base class.
- `reliabilityRole`: semantic role used by future topology traversal.
- `testCriterion` when relevant.

Roles introduced here: `SOURCE`, `NODE`, `TARGET`, `TESTER`, `TEST_LINK`, `FLAG`, `BOUNDARY`, `OFF_PAGE`, `FUNCTION_POINT`, `LOGIC`.

Hydraulic: Source, Node/Junction, Target/Sink, Tester (FLOW_AVAILABLE), Test Link, Flag, Boundary, Off-page Connector, Function Point.

Electrical: Electrical Source, Node/Junction, Load/Consumer, Voltage Tester (VOLTAGE_AVAILABLE), Tester Link, Flag, Boundary, Off-page Connector, Point of Interest.

I&C: Signal Source, Signal Node, Logic Node, AND, OR, Voting k/N, Permissive/Interlock, Command Target, Signal Tester (SIGNAL_AVAILABLE), Tester Link, Flag, Detected Failure Flag, Boundary.

HVAC: Air Source, Air Node, Zone/Room Consumer, Airflow Tester (AIRFLOW_AVAILABLE), Delta-P Tester (DELTA_P_AVAILABLE), Tester Link, Flag, Boundary, Off-page Connector.

These objects structure model inputs only. The backward-chaining fault-tree engine is not implemented by this change.
