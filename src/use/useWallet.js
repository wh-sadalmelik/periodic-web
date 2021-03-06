import { ref, onMounted } from 'vue';
import ElementABI from '../abi/Element';
import detectEthereumProvider from '@metamask/detect-provider';

export default () => {
  const installMetaMask = () => {
    if (!window.ethereum) {
      window.open(
        'https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn',
        '_blank',
      );
      return Promise.reject({ message: 'Please Install MetaMask!' });
    } else {
      return Promise.resolve();
    }
  };

  const mint = async (tokenId = '') => {
    await installMetaMask();
    const web3Object = new Web3(window.ethereum);

    return new web3Object.eth.Contract(ElementABI, import.meta.env.VITE_CONTRACT).methods
      .claim(tokenId)
      .send({
        from: window.ethereum.selectedAddress,
      });
  };

  const chainId = ref('');
  const account = ref('');

  onMounted(async () => {
    const provider = await detectEthereumProvider();

    if (provider) {
      chainId.value = provider.chainId;
      account.value = provider.selectedAddress;

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });

      window.ethereum.on('accountsChanged', (accounts) => {
        account.value = accounts[0] || '';
      });
    }
  });

  const shortCutOfAccountHash = (hash) => {
    return typeof hash === 'string'
      ? hash.replace(/^0x\w{4}(.*)\w{4}$/, (match, p1, offset, string) => {
          return string.replace(p1, '...');
        })
      : '';
  };

  const generatTokenId = () => Math.ceil(Math.random() * 6666);

  return {
    chainId,
    account,
    mint,

    connect: async () => {
      await installMetaMask();
      if (account.value) return;
      [account.value] = await window.ethereum.request({ method: 'eth_requestAccounts' });
    },

    shortCutOfAccountHash,
    generatTokenId,
  };
};
