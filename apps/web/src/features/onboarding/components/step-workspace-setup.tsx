'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { CircleAlert, Briefcase } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { CreateWorkspaceSchema, type CreateWorkspaceDto } from '@pikzee/shared-types'
import {
  Button,
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@pikzee/ui'

interface StepWorkspaceSetupProps {
  onNext: (data: CreateWorkspaceDto) => void
  onBack: () => void
  initialValues: Partial<CreateWorkspaceDto>
}

export function StepWorkspaceSetup({ onNext, onBack, initialValues }: StepWorkspaceSetupProps) {
  const [logoPreview, setLogoPreview] = useState<string>(initialValues.logoUrl || '')

  const { control, handleSubmit, setValue, watch } = useForm<CreateWorkspaceDto>({
    resolver: zodResolver(CreateWorkspaceSchema),
    defaultValues: {
      name: initialValues.name || '',
      slug: initialValues.slug || '',
      logoUrl: initialValues.logoUrl || '',
    },
  })

  const name = watch('name')
  const slug = watch('slug')

  // Auto-generate slug from name
  useEffect(() => {
    if (name) {
      const generatedSlug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      setValue('slug', generatedSlug, { shouldValidate: true })
    }
  }, [name, setValue])

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        setLogoPreview(base64String)
        // Store base64 preview, but on finish we can fallback to standard URL if needed
        setValue('logoUrl', base64String)
      }
      reader.readAsDataURL(file)
    }
  }

  // Generate initials for avatar preview
  const getInitials = (val: string) => {
    return val
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }

  const onSubmit = (data: CreateWorkspaceDto) => {
    // If logoUrl is empty or is a base64 (which fails Zod's url validation on backend),
    // set a fallback placeholder URL that passes z.url() validation
    if (!data.logoUrl || data.logoUrl.startsWith('data:')) {
      data.logoUrl = `https://avatar.vercel.sh/${data.slug}`
    }
    onNext(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight text-white">Create a workspace</h2>
        <p className="text-sm text-slate-400 mt-1">This is where your projects and docs live.</p>
      </div>

      <div className="flex flex-col items-center gap-3">
        <div className="relative flex items-center justify-center w-20 h-20 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 overflow-hidden shadow-inner">
          {logoPreview ? (
            <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
          ) : name ? (
            <span className="text-2xl font-bold text-indigo-400">{getInitials(name)}</span>
          ) : (
            <Briefcase size={28} />
          )}
        </div>

        <label className="cursor-pointer text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition">
          Upload Workspace Logo
          <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
        </label>
      </div>

      <FieldGroup className="space-y-4">
        <Controller
          name="name"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="name">Workspace Name</FieldLabel>
              <InputGroup>
                <InputGroupAddon align="inline-start">
                  <Briefcase className="text-slate-400" size={16} />
                </InputGroupAddon>
                <InputGroupInput
                  {...field}
                  id="name"
                  aria-invalid={fieldState.invalid}
                  placeholder="Acme Corp"
                  autoComplete="off"
                />
              </InputGroup>
              {fieldState.invalid ? (
                <span className="flex items-center gap-1 text-sm text-red-400 mt-1">
                  <CircleAlert size={15} />
                  <FieldError errors={[fieldState.error]} />
                </span>
              ) : (
                <p className="text-xs text-slate-500 mt-1">
                  Your workspace name (e.g., your company or department name).
                </p>
              )}
            </Field>
          )}
        />

        <Controller
          name="slug"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="slug">Workspace URL (Slug)</FieldLabel>
              <div className="flex gap-2 items-center">
                <div className="flex items-center rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-500 select-none">
                  pikzee.com/
                </div>
                <InputGroup className="flex-1">
                  <InputGroupInput
                    {...field}
                    id="slug"
                    aria-invalid={fieldState.invalid}
                    placeholder="acme-corp"
                    autoComplete="off"
                  />
                </InputGroup>
              </div>
              {fieldState.invalid ? (
                <span className="flex items-center gap-1 text-sm text-red-400 mt-1">
                  <CircleAlert size={15} />
                  <FieldError errors={[fieldState.error]} />
                </span>
              ) : (
                <p className="text-xs text-slate-500 mt-1">
                  Used for your custom dashboard URL. Lowercase letters, numbers, and dashes.
                </p>
              )}
            </Field>
          )}
        />
      </FieldGroup>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button type="submit" disabled={!name || !slug} className="flex-1">
          Continue
        </Button>
      </div>
    </form>
  )
}
