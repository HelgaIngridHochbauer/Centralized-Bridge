module bridge::ibt {
    use sui::coin::{Self, TreasuryCap};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use std::option;

    /// The OTW (One-Time Witness) for the IBT coin.
    struct IBT has drop {}

    /// Initializer called only once during module publication.
    fun init(witness: IBT, ctx: &mut TxContext) {
        let (treasury_cap, metadata) = coin::create_currency(
            witness, 
            9,                  // decimals
            b"IBT",             // symbol
            b"IBT Token",       // name
            b"Bridge Token",    // description
            option::none(),     // icon url
            ctx
        );
        // Make the metadata public so wallets/apps can see the token
        transfer::public_freeze_object(metadata);
        // Send the Minting Power (TreasuryCap) to the deployer
        transfer::public_transfer(treasury_cap, tx_context::sender(ctx));
    }

    public entry fun mint(
        treasury_cap: &mut TreasuryCap<IBT>, 
        amount: u64, 
        recipient: address, 
        ctx: &mut TxContext
    ) {
        coin::mint_and_transfer(treasury_cap, amount, recipient, ctx);
    }

    public entry fun burn(treasury_cap: &mut TreasuryCap<IBT>, coin: coin::Coin<IBT>) {
        coin::burn(treasury_cap, coin);
    }
}