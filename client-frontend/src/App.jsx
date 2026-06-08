import React, { useEffect, useMemo, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const currency = (value) => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
}).format(value);

const getCategoryProducts = (products, category) => {
  if (category === 'All') return products;
  return products.filter((product) => product.category === category);
};

function App() {
  const [catalog, setCatalog] = useState({ shops: [], products: [], categories: [] });
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [cart, setCart] = useState([]);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/catalog`)
      .then((response) => response.json())
      .then(setCatalog)
      .catch(() => setNotice('Backend is offline. Start it with npm run dev:backend.'));
  }, []);

  const searchedProducts = useMemo(() => {
    return catalog.products
      .filter((product) => product.name.toLowerCase().includes(query.toLowerCase()));
  }, [catalog.products, query]);

  const categorySummaries = useMemo(() => {
    const summaries = catalog.categories.map((item) => {
      const categoryProducts = getCategoryProducts(catalog.products, item);
      const fromPrice = categoryProducts.length
        ? Math.min(...categoryProducts.map((product) => product.price))
        : 0;

      return {
        name: item,
        count: categoryProducts.length,
        fromPrice,
        image: categoryProducts[0]?.image
      };
    });

    return [
      {
        name: 'All',
        count: catalog.products.length,
        fromPrice: catalog.products.length ? Math.min(...catalog.products.map((product) => product.price)) : 0,
        image: catalog.products[0]?.image
      },
      ...summaries
    ];
  }, [catalog.categories, catalog.products]);

  const displayedProducts = useMemo(() => {
    return getCategoryProducts(searchedProducts, category);
  }, [searchedProducts, category]);

  const groupedProducts = useMemo(() => {
    const activeCategories = category === 'All' ? catalog.categories : [category];

    return activeCategories
      .map((item) => ({
        name: item,
        products: getCategoryProducts(searchedProducts, item)
      }))
      .filter((group) => group.products.length);
  }, [catalog.categories, searchedProducts, category]);

  const cartTotal = cart.reduce((sum, product) => sum + product.price, 0);

  const addToCart = (product) => {
    setCart((items) => [...items, product]);
    setNotice(`${product.name} added to cart.`);
  };

  const checkout = async () => {
    if (!cart.length) return;

    const order = {
      customer: 'Demo Customer',
      shopId: cart[0].shopId,
      total: cartTotal,
      items: cart.length
    };

    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order)
    });
    const created = await response.json();
    setCart([]);
    setNotice(`Order ${created.id} placed. The merchant can now fulfill it.`);
  };

  return (
    <div className="app-shell storefront">
      <header className="topbar">
        <div className="brand-block">
          <a className="brand-mark" href="#top" aria-label="Erim home">erim</a>
          <div>
            <span className="eyebrow">Multi-store commerce</span>
            <h1>Shop curated products from independent stores on Erim.</h1>
          </div>
        </div>
        <div className="cart-pill">
          <span className="icon">Bag</span>
          <span>{cart.length} items</span>
          <strong>{currency(cartTotal)}</strong>
        </div>
      </header>

      <main className="layout">
        <section className="hero-panel" id="top">
          <div>
            <p className="eyebrow">Customer storefront</p>
            <h2>Discover stores, compare categories, and check out in one connected marketplace.</h2>
            <p>Erim brings active shops, live inventory, and merchant-ready orders into a single shopping experience.</p>
          </div>
          <div className="hero-metrics">
            <div><strong>{catalog.shops.length}</strong><span>active shops</span></div>
            <div><strong>{catalog.products.length}</strong><span>products</span></div>
          </div>
        </section>

        <section className="toolbar">
          <label className="searchbox">
            <span className="icon">Find</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products" />
          </label>
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option>All</option>
            {catalog.categories.map((item) => <option key={item}>{item}</option>)}
          </select>
          <button onClick={checkout} disabled={!cart.length}>
            Checkout
          </button>
        </section>

        {notice && <p className="notice">{notice}</p>}

        <section className="category-showcase" aria-label="Product categories">
          {categorySummaries.map((item) => (
            <button
              className={`category-tile ${category === item.name ? 'active' : ''}`}
              key={item.name}
              onClick={() => setCategory(item.name)}
              type="button"
            >
              <span
                className="category-image"
                style={{ backgroundImage: item.image ? `url(${item.image})` : undefined }}
              />
              <span className="category-copy">
                <strong>{item.name}</strong>
                <span>{item.count} products</span>
              </span>
              <span className="category-price">
                from {currency(item.fromPrice)}
              </span>
            </button>
          ))}
        </section>

        <section className="shop-strip">
          {catalog.shops.map((shop) => (
            <article key={shop.id} className="shop-card">
              <span className="icon">Shop</span>
              <div>
                <strong>{shop.name}</strong>
                <span>{shop.category} - {shop.location} - {shop.rating} rating</span>
              </div>
            </article>
          ))}
        </section>

        <section className="catalog-header">
          <div>
            <p className="eyebrow">Shop by category</p>
            <h2>{category === 'All' ? 'All product categories' : category}</h2>
          </div>
          <span>{displayedProducts.length} matching products</span>
        </section>

        {groupedProducts.length ? groupedProducts.map((group) => (
          <section className="category-section" key={group.name}>
            <div className="section-heading">
              <h3>{group.name}</h3>
              <span>{group.products.length} products</span>
            </div>
            <div className="product-grid">
              {group.products.map((product) => (
                <article key={product.id} className="product-card">
                  <img src={product.image} alt={product.name} />
                  <div className="product-body">
                    <span>{product.shop?.name}</span>
                    <h4>{product.name}</h4>
                    <p>{product.category} - {product.stock} in stock</p>
                    <div className="card-row">
                      <strong>{currency(product.price)}</strong>
                      <button onClick={() => addToCart(product)}>Add</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )) : (
          <section className="empty-state">
            <h3>No products found</h3>
            <p>Try another category or search term.</p>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
