import ProductCard from "./ProductCard";

function HomeProductList({ products }) {
  if (!products || products.length === 0) {
    return <div className="text-center py-10 text-gray-500">Ürün bulunamadı.</div>;
  }

  return (
    <section className="container mx-auto px-4 pb-20 pt-10">
      <div className="flex items-center gap-3 mb-8 border-b border-gray-100 pb-4">
         <div className="w-1.5 h-8 bg-red-700 rounded-full"></div>
         <h2 className="text-2xl font-bold text-gray-800">Tüm Ürünlerimiz</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {products.map((product) => (
          <div key={product.id} className="h-full">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}

export default HomeProductList;