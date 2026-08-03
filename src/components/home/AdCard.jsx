import { useEffect, useState } from "react";

export default function AdCard() {
  const [dismissed, setDismissed] = useState(false);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = Math.floor(Math.random() * 20) + 1; // fakestoreapi has 20 products
    fetch(`https://fakestoreapi.com/products/${id}`)
      .then((res) => res.json())
      .then(setProduct)
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, []);

  if (dismissed) return null;

  return (
    <div className="relative bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/10 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-4">
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 w-6 h-6 rounded-full bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 text-slate-600 dark:text-slate-300 text-xs flex items-center justify-center transition-colors z-10"
        title="Close ad"
      >
        ✕
      </button>

      <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide">Sponsored</span>

      {loading && <p className="text-xs text-slate-400 mt-2">Loading…</p>}

      {!loading && product && (
        <div className="mt-2 flex flex-col gap-2">
          <img src={product.image} alt={product.title} className="w-full h-32 object-contain bg-white rounded-lg p-2" />
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 line-clamp-2">{product.title}</p>
          <p className="text-sm font-bold text-amber-600 dark:text-amber-400">${product.price}</p>
          <button
            onClick={(e) => e.preventDefault()}
            className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold py-1.5 rounded-lg transition-colors"
          >
            Shop Now
          </button>
        </div>
      )}

      {!loading && !product && <p className="text-xs text-slate-400 mt-2">Ad couldn't load.</p>}
    </div>
  );
}