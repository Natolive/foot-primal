export interface FormFieldConfig<T> {
  name: keyof T & string
  label: string
  type?: 'text' | 'email' | 'password' | 'url' | 'number' | 'datetime-local' | 'textarea' | 'checkbox' | 'checkbox-group' | 'select'
  /** Choix d'un `select`. */
  options?: { label: string, value: string }[]
  /** Choix d'un `checkbox-group`, par groupe titré ; la valeur du champ est la liste des `value` cochées, tous groupes confondus. */
  groups?: { label?: string, items: { label: string, value: string }[] }[]
  disabled?: boolean
  autocomplete?: string
  placeholder?: string
  icon?: string
  help?: string
  /** Occupe une demi-ligne sur écran large (ex. Nom / Prénom côte à côte). */
  half?: boolean
}
