'use client'

import { Plus, Trash2, Mail, CircleAlert } from 'lucide-react'
import React, { useState } from 'react'

import { Button, FieldLabel, InputGroup, InputGroupAddon, InputGroupInput } from '@pikzee/ui'

export interface InviteRow {
  email: string
  role: 'ADMIN' | 'EDITOR' | 'COMMENTER' | 'VIEWER'
}

interface StepInviteMembersProps {
  onNext: (invites: InviteRow[]) => void
  onBack: () => void
  loading: boolean
}

export function StepInviteMembers({ onNext, onBack, loading }: StepInviteMembersProps) {
  const [invites, setInvites] = useState<InviteRow[]>([{ email: '', role: 'EDITOR' }])
  const [error, setError] = useState<string>('')

  const handleAddRow = () => {
    setInvites([...invites, { email: '', role: 'EDITOR' }])
  }

  const handleRemoveRow = (index: number) => {
    const nextInvites = [...invites]
    nextInvites.splice(index, 1)
    setInvites(nextInvites)
  }

  const handleEmailChange = (index: number, val: string) => {
    const nextInvites = [...invites]
    nextInvites[index].email = val
    setInvites(nextInvites)
  }

  const handleRoleChange = (index: number, val: InviteRow['role']) => {
    const nextInvites = [...invites]
    nextInvites[index].role = val
    setInvites(nextInvites)
  }

  const validateAndSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Filter out empty emails
    const validInvites = invites.filter((row) => row.email.trim() !== '')

    // Validate email formats
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const hasInvalidEmail = validInvites.some((row) => !emailRegex.test(row.email))

    if (hasInvalidEmail) {
      setError('Please enter a valid email address for all fields.')
      return
    }

    onNext(validInvites)
  }

  return (
    <form onSubmit={validateAndSubmit} className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight text-white">Invite your team</h2>
        <p className="text-sm text-slate-400 mt-1">
          Collab is better together. Add some members (optional).
        </p>
      </div>

      {error && (
        <div className="flex items-center rounded-md bg-red-900/30 border border-red-800 p-3 text-sm text-red-400 gap-1.5">
          <CircleAlert size={15} />
          <p>{error}</p>
        </div>
      )}

      <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
        {invites.map((row, idx) => (
          <div key={idx} className="flex gap-2 items-end">
            <div className="flex-1">
              {idx === 0 && <FieldLabel htmlFor={`email-${idx}`}>Email Address</FieldLabel>}
              <InputGroup>
                <InputGroupAddon align="inline-start">
                  <Mail className="text-slate-400" size={16} />
                </InputGroupAddon>
                <InputGroupInput
                  id={`email-${idx}`}
                  type="email"
                  value={row.email}
                  placeholder="name@company.com"
                  onChange={(e) => handleEmailChange(idx, e.target.value)}
                  autoComplete="off"
                />
              </InputGroup>
            </div>

            <div className="w-32">
              {idx === 0 && <FieldLabel htmlFor={`role-${idx}`}>Role</FieldLabel>}
              <select
                id={`role-${idx}`}
                value={row.role}
                onChange={(e) => handleRoleChange(idx, e.target.value as InviteRow['role'])}
                className="w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none h-9.5"
              >
                <option value="ADMIN">Admin</option>
                <option value="EDITOR">Editor</option>
                <option value="COMMENTER">Commenter</option>
                <option value="VIEWER">Viewer</option>
              </select>
            </div>

            {invites.length > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => handleRemoveRow(idx)}
                className="text-slate-400 hover:text-red-400 hover:border-red-500/30 h-9.5 w-9.5 p-0 flex items-center justify-center"
              >
                <Trash2 size={16} />
              </Button>
            )}
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="ghost"
        onClick={handleAddRow}
        className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold p-0 h-auto"
      >
        <Plus size={14} />
        <span>Add another email</span>
      </Button>

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={loading}
          className="flex-1"
        >
          Back
        </Button>
        <Button type="submit" disabled={loading} className="flex-1">
          {loading
            ? 'Finishing setup...'
            : invites.some((i) => i.email.trim() !== '')
              ? 'Finish Setup'
              : 'Skip & Finish'}
        </Button>
      </div>
    </form>
  )
}
