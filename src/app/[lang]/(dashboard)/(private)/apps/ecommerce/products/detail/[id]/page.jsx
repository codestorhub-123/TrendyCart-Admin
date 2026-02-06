import ProductDetail from '@views/apps/ecommerce/products/ProductDetail'

const ProductDetailPage = async ({ params }) => {
  const { id } = await params
  
  return <ProductDetail productId={id} />
}

export default ProductDetailPage
