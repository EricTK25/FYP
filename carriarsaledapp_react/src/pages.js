import React from 'react';
import { useEthereum } from './EthereumContext';

export function MyTokens() {
    const { allTokens } = useEthereum();

    return (
        <div className="MyTokens">
            <h1>MyTokens</h1>
            <p>{JSON.stringify(allTokens)}</p>
        </div>
    );
}
export function MintToken() {
    return (<h1>MintToken</h1>);
}
export function TokenDetail() {
    return (<h1>TokenDetail</h1>);
}
export function Transactions() {
    return (<h1>Transactions</h1>);
}