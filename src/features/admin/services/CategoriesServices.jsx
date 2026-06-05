// ─── Lógica de negocio de la feature Categories ─────────────────────────
// Funciones puras: sin estado, sin efectos secundarios, fáciles de testear.


export const filterCategories = (categories, query) => {
    const q = query.toLowerCase().trim();
    if (!q) return categories;
    return categories.filter(
      (c) => c.name.toLowerCase().includes(q) || String(c.codigo ?? c.id).toLowerCase().includes(q)
    );
  };
  
  
  export const validateCategoryForm = (form) => {
    if (!form.name.trim()) {
      return { valid: false, errorKey: "alert_name_required" };
    }
    return { valid: true, errorKey: null };
  };
  
  
  export const buildNewCategory = (form, id) => ({
    id,
    name:        form.name,
    icon:        form.icon,
    description: form.description,
    questions:   0,
  });
  
  
  export const applyFormToCategory = (category, form) => ({
    ...category,
    name:        form.name,
    icon:        form.icon,
    description: form.description,
  });