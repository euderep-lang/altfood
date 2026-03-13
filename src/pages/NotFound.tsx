import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import AltfoodIcon from '@/components/AltfoodIcon';
import { motion } from "framer-motion";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-sm space-y-6"
      >
        <div className="flex items-center justify-center gap-2.5 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-sm">
            <Leaf className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold text-foreground tracking-tight">Altfood</span>
        </div>
        <div>
          <h1 className="text-6xl font-bold text-foreground">404</h1>
          <p className="text-base text-muted-foreground mt-2">
            Página não encontrada
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            O endereço que você tentou acessar não existe.
          </p>
        </div>
        <Link to="/">
          <Button className="rounded-xl h-11 gap-2 bg-primary hover:bg-primary/90">
            <Home className="w-4 h-4" /> Voltar para o início
          </Button>
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;
