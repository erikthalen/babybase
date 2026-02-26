import { describe, it, expect } from 'vitest'
import { layout, nav } from './layout.ts'

describe('layout', () => {
  it('renders html document with datastar CDN script', () => {
    const html = layout({ title: 'Test', nav: '', content: '<p>hi</p>' })
    expect(html).toContain('<!DOCTYPE html>')
    expect(html).toContain('datastar')
    expect(html).toContain('<p>hi</p>')
    expect(html).toContain('Test')
  })

  it('includes id="main" on the main element', () => {
    const html = layout({ title: 'T', nav: '', content: '' })
    expect(html).toContain('id="main"')
  })
})

describe('nav', () => {
  it('renders links prefixed with basePath', () => {
    const html = nav({ basePath: '/admin', activeSection: 'tables' })
    expect(html).toContain('/admin/tables')
    expect(html).toContain('/admin/schema')
    expect(html).toContain('/admin/migrations')
    expect(html).toContain('/admin/backups')
  })
})
