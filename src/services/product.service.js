const products = [
  {
    code: 'hello',
    title: 'Hello',
    description: 'Hashcoin Hello Test Product',
    amount_xtr: 454
  },
  {
    code: 'member_access',
    title: 'Member Access',
    description: 'Hashcoin Member Access',
    amount_xtr: 9075
  },
  {
    code: 'exclusive_content_level_1',
    title: 'Exclusive content level 1',
    description: 'Hashcoin Exclusive content level 1',
    amount_xtr: 45373
  },
  {
    code: 'exclusive_content_level_2',
    title: 'Exclusive content level 2',
    description: 'Hashcoin Exclusive content level 2',
    amount_xtr: 90746
  },
  {
    code: 'exclusive_content_level_3',
    title: 'Exclusive content level 3',
    description: 'Hashcoin Exclusive content level 3',
    amount_xtr: 226865
  },
  {
    code: 'exclusive_content_level_4',
    title: 'Exclusive content level 4',
    description: 'Hashcoin Exclusive content level 4',
    amount_xtr: 453731
  },
  {
    code: 'exclusive_content_level_5',
    title: 'Exclusive content level 5',
    description: 'Hashcoin Exclusive content level 5',
    amount_xtr: 680596
  },
  {
    code: 'vip_access',
    title: 'VIP Access',
    description: 'Hashcoin VIP Access',
    amount_xtr: 45373
  },
  {
    code: 'vip_content_level_1',
    title: 'VIP content level 1',
    description: 'Hashcoin VIP content level 1',
    amount_xtr: 907462
  },
  {
    code: 'vip_content_level_2',
    title: 'VIP content level 2',
    description: 'Hashcoin VIP content level 2',
    amount_xtr: 1361192
  },
  {
    code: 'vip_content_level_3',
    title: 'VIP content level 3',
    description: 'Hashcoin VIP content level 3',
    amount_xtr: 2268654
  }
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
