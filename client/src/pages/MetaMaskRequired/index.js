import React from 'react'
import missingWallet from './missingWallet.svg'
import { Card, Text, Icon, MetaMaskButton, Image } from 'rimble-ui';

const MetaMaskRequired = () => <Card width={'300px'} mx={'auto'} px={4}>
  <Image src={missingWallet} height={'100px'}/>
  <Text
    caps
    fontSize={0}
    fontWeight={4}
    mb={3}
    mt={3}
    display={'flex'}
    alignItems={'center'}
  >
    <Icon name={'AccountBalanceWallet'} mr={2} />
    Connect your Wallet:
  </Text>
  <MetaMaskButton.Outline>Install MetaMask</MetaMaskButton.Outline>
</Card>

export default MetaMaskRequired