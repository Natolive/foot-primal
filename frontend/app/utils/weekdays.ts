import { WEEKDAY_LABELS, WEEKDAYS } from '@footix/shared'

// Jours de la semaine au format des champs `checkbox-group` de FormBuilder (dispos).
export const weekdayGroups = [{ items: WEEKDAYS.map((value) => ({ value, label: WEEKDAY_LABELS[value] })) }]
