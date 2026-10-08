import { useState } from 'react';
import useInView from '../hooks/useInView.js';
import './FeaturedMenu.css';

const categories = [
  { label: 'All', value: 'all' },
  { label: 'Coffee', value: 'coffee' },
  { label: 'Bakes', value: 'bakes' },
  { label: 'Cold', value: 'cold' },
];

const menuItems = [
  {
    name: 'Signature Latte',
    desc: 'Double espresso, velvet steamed milk, cocoa dust',
    price: 320,
    img: 'https://images.unsplash.com/photo-1573074699584-303c79998c3a?fm=jpg&q=80&w=700&auto=format&fit=crop',
    tag: 'best-seller',
    category: 'coffee',
  },
  {
    name: 'Hand-Poured Pour Over',
    desc: 'Single-origin beans, slow dripped to perfection',
    price: 290,
    img: 'https://images.unsplash.com/photo-1561522983-385a76fbb4cb?fm=jpg&q=80&w=700&auto=format&fit=crop',
    tag: null,
    category: 'coffee',
  },
  {
    name: 'Golden Mocha',
    desc: 'Dark chocolate, espresso and silky foam art',
    price: 340,
    img: 'https://images.unsplash.com/photo-1757839462651-e457481ede49?fm=jpg&q=80&w=700&auto=format&fit=crop',
    tag: null,
    category: 'coffee',
  },
  {
    name: 'Butter Croissant',
    desc: 'Flaky, 24-layer, baked fresh every sunrise',
    price: 180,
    img: 'https://images.unsplash.com/photo-1714801172470-bf71c2ac1884?fm=jpg&q=80&w=700&auto=format&fit=crop',
    tag: 'fresh',
    category: 'bakes',
  },
  {
    name: 'Petit Desserts',
    desc: 'Tarts, cheesecakes & pastries from our oven',
    price: 210,
    img: 'https://images.unsplash.com/photo-1747829581661-25b6c86db988?fm=jpg&q=80&w=700&auto=format&fit=crop',
    tag: null,
    category: 'bakes',
  },
  {
    name: 'Cocoa Bean & Me',
    desc: 'Slow reading corner: iced coffee with a good book',
    price: 360,
    img: 'https://images.unsplash.com/photo-1755882941433-935ff9b7ad0e?fm=jpg&q=80&w=700&auto=format&fit=crop',
    tag: null,
    category: 'cold',
  },
];

export default function FeaturedMenu() {
  const [tab, setTab] = useState('all');
  const [ref, inView] = useInView();

  const items = tab === 'all' ? menuItems : menuItems.filter((i) => i.category === tab);

  return (
    <section id="menu" className="section-pad menu-section">
      <div className="container">
        <div className={`section-head reveal ${inView ? 'in-view' : ''}`} ref={ref}>
          <span className="kicker">what we pour</span>
          <h2 className="section-title">Featured From the Menu</h2>
          <div className="divider"></div>
        </div>

        <div className={`menu-tabs ${inView ? 'in-view' : ''}`}>
          {categories.map((c) => (
            <button
              key={c.value}
              className={`menu-tab ${tab === c.value ? 'menu-tab-active' : ''}`}
              onClick={() => setTab(c.value)}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="menu-grid">
          {items.map((item) => (
            <article className="menu-card" key={item.name}>
              <div className="menu-img">
                <img src={item.img} alt={item.name} loading="lazy" decoding="async" />
                {item.tag && <span className="menu-tag">{item.tag}</span>}
              </div>
              <div className="menu-body">
                <div className="menu-row">
                  <h3>{item.name}</h3>
                  <span className="menu-price">&#8377;{item.price}</span>
                </div>
                <p>{item.desc}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="menu-cta">
          <a href="#newsletter" className="btn btn-ghost">
            View Full Menu
          </a>
        </div>
      </div>
    </section>
  );
}