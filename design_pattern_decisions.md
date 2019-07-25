# Design Pattern Decisions

The SalePlace project features several design choices that were influenced by the ConsenSys course materials . Chief among these decisions was the idea to avoid any loops or itterations over array , modularize the contracts and functions as much as possible (seperation of concerns) and making heavy use of checks and require statements. Deliberately emitting events and use of library SafeMath were also design decisions. 

SalePlace contract suite consists of four main objectives , record item and invoice details , update invoice state and payments for the item purchased. Furthermore, functions were written to be modular and simple wherever possible. Modifiers and require statements were used as checks in these functions to limit attack vectors and prevent wasteful operations. 

Events are emitted in almost every function - this is used to debug and provide useful information when events occur. 

Due to the limitation of fetching list of items at the same time from the node , frontend is intergrated with firebase realtime database service to store and retrive the item and invoices .This should reduce the contract function calls and increase the scalability and performance of the application.

I decided to not to implement the contract in a upgradeable pattern ,my aim is to create an immutable registry that works without trusting the owner of the contract. Upgradeability breaks immutability.

The contract itself dosenot hold any funds like escrow , any transaction balances if present are returned back to the payee after a successfull transaction

In order to implement the emergency stop the Pausable contract was inherited by the SalePlace contract. This means that the contract is ownable and pausable at any time in the case an attack is exhibited. This pause functionality was tested via javascript tests. This pattern was implemented because it was the most straightforward: Pausable is a well audited contract made by OpenZepplin so its definitely a good idea to use it instead of rolling your own emergency stop!