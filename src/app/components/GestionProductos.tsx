import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { toast } from 'sonner';
import { Producto } from '../types';

interface GestionProductosProps {
  productos: Producto[];
  onActualizarProductos: (productos: Producto[]) => void;
}

const categorias = ['Bebidas Calientes', 'Bebidas Frías', 'Repostería', 'Sándwiches'];

export function GestionProductos({ productos, onActualizarProductos }: GestionProductosProps) {
  const [dialogoAbierto, setDialogoAbierto] = useState(false);
  const [productoEditando, setProductoEditando] = useState<Producto | null>(null);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [categoria, setCategoria] = useState('');
  const [imagen, setImagen] = useState('');
  const [disponible, setDisponible] = useState(true);

  const abrirDialogo = (producto?: Producto) => {
    if (producto) {
      setProductoEditando(producto);
      setNombre(producto.nombre);
      setDescripcion(producto.descripcion);
      setPrecio(producto.precio.toString());
      setCategoria(producto.categoria);
      setImagen(producto.imagen);
      setDisponible(producto.disponible);
    } else {
      setProductoEditando(null);
      setNombre('');
      setDescripcion('');
      setPrecio('');
      setCategoria('');
      setImagen('https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=400');
      setDisponible(true);
    }
    setDialogoAbierto(true);
  };

  const cerrarDialogo = () => {
    setDialogoAbierto(false);
    setProductoEditando(null);
    setNombre('');
    setDescripcion('');
    setPrecio('');
    setCategoria('');
    setImagen('');
    setDisponible(true);
  };

  const guardarProducto = () => {
    if (!nombre || !precio || !categoria) {
      toast.error('Complete todos los campos requeridos');
      return;
    }

    if (Number(precio) <= 0) {
      toast.error('El precio debe ser mayor a 0');
      return;
    }

    if (productoEditando) {
      const productosActualizados = productos.map(p =>
        p.id === productoEditando.id
          ? { ...p, nombre, descripcion, precio: Number(precio), categoria, imagen, disponible }
          : p
      );
      onActualizarProductos(productosActualizados);
      toast.success('Producto actualizado');
    } else {
      const nuevoProducto: Producto = {
        id: Date.now().toString(),
        nombre,
        descripcion,
        precio: Number(precio),
        categoria,
        imagen,
        disponible
      };
      onActualizarProductos([...productos, nuevoProducto]);
      toast.success('Producto agregado');
    }

    cerrarDialogo();
  };

  const eliminarProducto = (id: string) => {
    if (confirm('¿Está seguro de eliminar este producto?')) {
      onActualizarProductos(productos.filter(p => p.id !== id));
      toast.success('Producto eliminado');
    }
  };

  const productosPorCategoria = categorias.map(cat => ({
    categoria: cat,
    productos: productos.filter(p => p.categoria === cat)
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl">Gestión de Productos</h2>
          <p className="text-gray-500">Administre el catálogo de productos</p>
        </div>
        <Dialog open={dialogoAbierto} onOpenChange={setDialogoAbierto}>
          <DialogTrigger asChild>
            <Button className="bg-amber-600 hover:bg-amber-700">
              <Plus className="size-4 mr-2" />
              Agregar Producto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {productoEditando ? 'Editar Producto' : 'Agregar Producto'}
              </DialogTitle>
              <DialogDescription>
                Complete los datos del producto
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre del Producto</Label>
                <Input
                  id="nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Café Americano"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Ej: Café Americano con leche"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="precio">Precio</Label>
                <Input
                  id="precio"
                  type="number"
                  step="0.01"
                  min="0"
                  value={precio}
                  onChange={(e) => setPrecio(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label>Categoría</Label>
                <Select value={categoria} onValueChange={setCategoria}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Imagen</Label>
                <Input
                  id="imagen"
                  value={imagen}
                  onChange={(e) => setImagen(e.target.value)}
                  placeholder="URL de la imagen"
                />
              </div>
              <div className="space-y-2">
                <Label>Disponible</Label>
                <Select value={disponible ? 'true' : 'false'} onValueChange={value => setDisponible(value === 'true')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione disponibilidad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Disponible</SelectItem>
                    <SelectItem value="false">No disponible</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={guardarProducto} className="flex-1 bg-green-600 hover:bg-green-700">
                  {productoEditando ? 'Actualizar' : 'Guardar'}
                </Button>
                <Button onClick={cerrarDialogo} variant="outline" className="flex-1">
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {productosPorCategoria.map(({ categoria, productos: productosCat }) => (
        <Card key={categoria}>
          <CardHeader>
            <CardTitle>{categoria}</CardTitle>
            <CardDescription>{productosCat.length} productos</CardDescription>
          </CardHeader>
          <CardContent>
            {productosCat.length === 0 ? (
              <p className="text-center text-gray-500 py-4">
                No hay productos en esta categoría
              </p>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left">Producto</th>
                      <th className="px-4 py-2 text-right">Precio</th>
                      <th className="px-4 py-2 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productosCat.map(producto => (
                      <tr key={producto.id} className="border-t">
                        <td className="px-4 py-3">{producto.nombre}</td>
                        <td className="px-4 py-3 text-right">
                          ${producto.precio.toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2 justify-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => abrirDialogo(producto)}
                            >
                              <Pencil className="size-4 text-blue-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => eliminarProducto(producto.id)}
                            >
                              <Trash2 className="size-4 text-red-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}