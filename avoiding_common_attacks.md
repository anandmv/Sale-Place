# Avoiding Common Attacks
Several security decisions were made over the course of implementing the SalePlace project. Key among them were heavy use of require statements and user validations. Some design decisions deliberately limited user functionality in order to prevent attacks and adverse selection.

Race conditions are limited by limiting state of an item invoice. For example an invoice state can be only update by a seller user to Shipped status and its validated by a require condition which provides authenticity for the data.Those actions are irreversible at the same time, thus keeping a version of each state at the same time.

Overflow/underflow attacks are minimized by use of the SafeMath library for all arithmetic operations.

Gas revert attacks are minimized by the functions being atomic - there are no iterations over arrays or other functions with unknown gas requirements. The user pays the required gas and the transaction either succeeds or does not.
