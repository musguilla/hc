const products = [
  {
    code: 'hello',
    title: 'Hello',
    description: 'Hashcoin Hello Test Product',
    amount_xtr: 250
  },
  {
    code: 'member_access',
    title: 'Member Access',
    description: 'Hashcoin Member Access',
    amount_xtr: 9075
  },
  {
    code: 'exclusive_content_level_1',
    title: 'Exclusive L1',
    description: 'Hashcoin Exclusive L1',
    amount_xtr: 45373
  },
  {
    code: 'exclusive_content_level_2',
    title: 'Exclusive L2',
    description: 'Hashcoin Exclusive L2',
    amount_xtr: 90746
  },
  {
    code: 'exclusive_content_level_3',
    title: 'Exclusive L3',
    description: 'Hashcoin Exclusive L3',
    amount_xtr: 100000
  },
];

function getProducts() {
  return products;
}

function getProductByCode(code) {
  return products.find(p => p.code === code);
}

module.exports = {
  getProducts,
  getProductByCode
};
