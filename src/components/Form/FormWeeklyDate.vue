<template>
  <div class="weekday-selector">
    <label v-if="label" class="selector-label">{{ label }}</label>
    <div class="day-container">
      <div
        v-for="day of days"
        :key="`day-${day.value}`"
        class="day-cell"
        :class="{ selected: isSelected(day.value) }"
        @click="toggleDay(day.value)"
      >
        <div class="day-content">
          <div class="day-name">{{ day.label }}</div>
          <div class="day-checkbox">
            <i v-if="isSelected(day.value)" class="fas fa-check-circle"></i>
            <i v-else class="far fa-circle"></i>
          </div>
        </div>
      </div>
    </div>
    <small v-if="description" class="text-muted">{{ description }}</small>
  </div>
</template>

<script>
export default {
  props: {
    modelValue: {
      type: Array,
      default: () => []
    },
    label: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data: () => ({
    days: [
      { label: 'Lun', value: 1 },
      { label: 'Mar', value: 2 },
      { label: 'Mié', value: 3 },
      { label: 'Jue', value: 4 },
      { label: 'Vie', value: 5 },
      { label: 'Sáb', value: 6 },
      { label: 'Dom', value: 7 }
    ]
  }),
  methods: {
    isSelected(dayValue) {
      return this.modelValue.includes(dayValue)
    },
    toggleDay(dayValue) {
      if (this.disabled) return

      const selected = [...this.modelValue]
      const index = selected.indexOf(dayValue)

      if (index > -1) {
        selected.splice(index, 1)
      } else {
        selected.push(dayValue)
      }

      this.$emit(
        'update:modelValue',
        selected.sort((a, b) => a - b)
      )
    }
  }
}
</script>

<style scoped>
.weekday-selector {
  width: 100%;
  margin-bottom: 1rem;
}

.selector-label {
  display: block;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #374151;
}

.day-container {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.day-cell {
  flex: 1;
  padding: 0;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background-color: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.day-cell:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
}

.day-cell.selected {
  background-color: var(--color-primary);
  border-color: var(--color-primary-shade);
}

.day-cell.selected .day-name {
  color: #ffffff;
  font-weight: 600;
}

.day-cell.selected .day-checkbox i {
  color: #ffffff;
}

.day-content {
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.day-name {
  font-size: 12px;
  font-weight: 500;
  color: #374151;
  text-transform: uppercase;
}

.day-checkbox i {
  font-size: 16px;
  color: #9ca3af;
  transition: color 0.2s ease;
}

.day-cell:hover .day-checkbox i {
  color: var(--color-primary-shade);
}

.text-muted {
  display: block;
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

@media (max-width: 768px) {
  .weekday-selector table {
    border-spacing: 4px;
  }

  .day-content {
    padding: 8px 4px;
  }

  .day-name {
    font-size: 12px;
  }

  .day-checkbox i {
    font-size: 16px;
  }
}
</style>
