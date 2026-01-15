import { useMemo, useState } from 'react'
import { ConfigProvider, DatePicker, Tooltip } from 'antd'
import ptBR from 'antd/locale/pt_BR'
import dayjs, { Dayjs } from 'dayjs'
import 'dayjs/locale/pt-br'
import './CustomDatePicker.css'

dayjs.locale('pt-br')

const { RangePicker } = DatePicker

type Range = [Dayjs, Dayjs] | null
type Mode = 'cycle' | 'period'

function getCycle(ref: Dayjs): [Dayjs, Dayjs] {
  const start =
    ref.date() >= 5
      ? ref.startOf('month').date(5)
      : ref.subtract(1, 'month').startOf('month').date(5)

  const end = start.add(1, 'month').date(4)
  return [start.startOf('day'), end.endOf('day')]
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function formatTrigger(range: Range) {
  if (!range) return 'Selecione um período'

  const [s, e] = range
  const sm = cap(s.format('MMMM'))
  const em = cap(e.format('MMMM'))
  const sy = s.format('YYYY')
  const ey = e.format('YYYY')
  const sd = s.format('DD/MM')
  const ed = e.format('DD/MM')

  if (sy !== ey) return `${sm} de ${sy} - ${em} de ${ey} (${sd} - ${ed})`
  if (sm !== em) return `${sm} - ${em} de ${sy} (${sd} - ${ed})`
  return `${sm} de ${sy} (${sd} - ${ed})`
}

const rangePickerLocale = {
  ...ptBR.DatePicker,
  lang: {
    ...(ptBR.DatePicker?.lang as any),
    ok: 'Aplicar',
  },
} as any

export default function CustomDatePicker() {
  const [value, setValue] = useState<Range>(() => getCycle(dayjs()))
  const [mode, setMode] = useState<Mode>('cycle')

  const cycles = useMemo(() => {
    const now = dayjs()
    const items: { label: React.ReactNode; value: [Dayjs, Dayjs] }[] = []

    const cur = getCycle(now)
    items.push({ label: 'Ciclo atual', value: cur })

    const prev = getCycle(now.subtract(1, 'month'))
    items.push({ label: 'Ciclo anterior', value: prev })

    for (let i = 2; i <= 6; i++) {
      const c = getCycle(now.subtract(i, 'month'))
      items.push({
        label: `Ciclo (${c[0].format('MM/YY')} - ${c[1].format('MM/YY')})`,
        value: c,
      })
    }

    return items
  }, [])

  const prefix = mode === 'cycle' ? 'Ciclo:' : 'Período:'
  const triggerText = formatTrigger(value)

  return (
    <ConfigProvider
      locale={ptBR}
      theme={{
        token: {
          colorPrimary: '#7A52E1',
          colorInfo: '#7A52E1',
          colorLink: '#7A52E1',
        },
      }}
    >
      <div className="cycle-wrap">
        <Tooltip title="Ciclo anterior">
          <button
            type="button"
            className="cycle-arrow"
            onClick={() => {
              if (!value) return
              setMode('cycle')
              setValue(getCycle(value[0].subtract(1, 'month')))
            }}
          >
            &lt;
          </button>
        </Tooltip>

        {/* Trigger real (RangePicker), visual como texto/link */}
        <div className="cycle-trigger">
          <span className="cycle-prefix">{prefix}</span>
          <span className="cycle-text">{triggerText}</span>

          <RangePicker
            className="cycle-picker"
            value={value as any}
            presets={cycles as any}
            locale={rangePickerLocale}
            // @ts-ignore (sua versão pode não ter no type)
            needConfirm
            allowClear
            placement="bottomLeft"
            inputReadOnly
            format="DD/MM/YYYY"
            // Quando mexer no calendário manualmente, vira período
            onCalendarChange={() => setMode('period')}
            // Só muda o valor quando confirmar (needConfirm)
            onChange={(v: any) => {
              if (!v || !v[0] || !v[1]) return
              const next: [Dayjs, Dayjs] = [v[0], v[1]]
              setValue(next)

              // detecta se o range é exatamente um ciclo conhecido
              const isCycle = cycles.some((c) => {
                const [cs, ce] = c.value
                return cs.isSame(next[0], 'day') && ce.isSame(next[1], 'day')
              })
              setMode(isCycle ? 'cycle' : 'period')
            }}
          />
        </div>

        <Tooltip title="Próximo ciclo">
          <button
            type="button"
            className="cycle-arrow"
            onClick={() => {
              if (!value) return
              setMode('cycle')
              setValue(getCycle(value[0].add(1, 'month')))
            }}
          >
            &gt;
          </button>
        </Tooltip>
      </div>
    </ConfigProvider>
  )
}
