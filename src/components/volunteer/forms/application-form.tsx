'use client';

import { ShieldSpinLoader } from '@/components/custom/loading';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

import { statusConfig } from '@/data/status';
import { documentTypes, steps } from '@/data/volunteer/application-details';

import useVolunteerSubmitApplication from '@/hooks/use-volunteer-submit-application';
import { cn } from '@/lib/utils';

import type {
  ApplicationFormClientProps,
  MultiUploadSlotProps,
  SingleUploadSlotProps,
} from '@/types';

import { format, parse } from 'date-fns';

import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CalendarIcon,
  Camera,
  Check,
  CheckCircle,
  ExternalLink,
  FileText,
  Heart,
  IdCard,
  MapPinHouse,
  Phone,
  Upload,
  User,
  Workflow,
  X,
} from 'lucide-react';

import { useRouter } from 'next/navigation';
import { Controller } from 'react-hook-form';
import { toast } from 'sonner';

import { listBarangays, listMuncities, listProvinces } from '@/lib/psgc';
import { ApplicationPreview } from '../application-preview';

export function ApplicationFormClient({
  existingApplication,
  userData,
  availableRoles,
}: ApplicationFormClientProps) {
  const router = useRouter();

  const {
    docs,
    step,
    setStep,
    step1Data,
    control,
    watch,
    setValue,
    isSubmitting,
    isDraftSaving,
    uploadingKeys,
    certified,
    setCertified,
    register,
    handleSubmit,
    errors,
    handleFileChange,
    handleMultiFileChange,
    removeMultiFile,
    onStep1Submit,
    onSaveDraft,
    onFinalSubmit,
    MAX_MULTI_FILES,
    getMissingDocumentMessage,
  } = useVolunteerSubmitApplication({
    firstName: userData?.firstName,
    lastName: userData?.lastName,
    email: userData?.email,
    existingApplication,
  });

  const employmentStatus = watch('employmentStatus');
  const primaryRole = watch('primaryRole');

  const provinceCode = watch('provinceCode');
  const municipalityCode = watch('municipalityCode');
  const barangayCode = watch('barangayCode');

  const provinces = listProvinces();
  const municipalities = listMuncities();
  const barangays = listBarangays();

  const selectedProvince = provinces.find(
    (province) => province.psgcCode === provinceCode,
  );

  const provinceLookupCode = selectedProvince?.psgcCode.slice(0, 5);

  const filteredMunicipalities = provinceLookupCode
    ? municipalities.filter(
        (municipality) =>
          municipality.psgcCode.slice(0, 5) === provinceLookupCode,
      )
    : [];

  const selectedMunicipality = filteredMunicipalities.find(
    (municipality) => municipality.psgcCode === municipalityCode,
  );

  const municipalityLookupCode = selectedMunicipality?.psgcCode.slice(0, 7);

  const filteredBarangays = municipalityLookupCode
    ? barangays.filter(
        (barangay) => barangay.psgcCode.slice(0, 7) === municipalityLookupCode,
      )
    : [];

  const selectedBarangay = filteredBarangays.find(
    (barangay) => barangay.psgcCode === barangayCode,
  );

  const secondaryRoleOptions = availableRoles.filter(
    (role) => role !== primaryRole,
  );

  if (
    existingApplication &&
    existingApplication.applicationStatus !== 'draft'
  ) {
    const cfg = statusConfig[existingApplication.applicationStatus];

    const Icon = cfg.icon;

    return (
      <div className="w-full pb-10">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Application</h1>

          <p className="mt-0.5 text-sm text-gray-500">
            Track your volunteer application status
          </p>
        </div>

        <div className={`mt-4 mb-2 rounded-lg border p-6 ${cfg.bg}`}>
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border bg-white/60">
              <Icon className={`h-6 w-6 ${cfg.color}`} />
            </div>

            <div>
              <h2 className={`text-lg font-bold ${cfg.color}`}>
                Status: {cfg.label}
              </h2>

              <p className="mt-1 text-sm text-gray-600">
                {existingApplication.applicationStatus === 'pending' &&
                  'Your application is in the queue. MDRRMO staff will review it within 3–5 business days.'}

                {existingApplication.applicationStatus === 'under_review' &&
                  "Our team is currently reviewing your application. You'll hear from us soon."}

                {existingApplication.applicationStatus === 'approved' &&
                  'Congratulations! Your application has been approved. You will be contacted for orientation and next steps.'}

                {existingApplication.applicationStatus === 'rejected' &&
                  'We were unable to approve your application at this time. You may contact MDRRMO for more details or re-apply later.'}
              </p>

              {existingApplication.submittedAt && (
                <p className="mt-2 text-xs text-gray-400">
                  Submitted on{' '}
                  {new Date(existingApplication.submittedAt).toLocaleDateString(
                    'en-PH',
                    {
                      dateStyle: 'long',
                    },
                  )}
                </p>
              )}
            </div>
          </div>
        </div>

        <ApplicationPreview />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full space-y-6 overflow-hidden py-10 md:py-0 md:pb-10">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Volunteer Application
        </h1>

        <p className="mt-0.5 text-sm text-gray-500">
          Disaster Relief Volunteer Registration Form
        </p>

        {existingApplication?.applicationStatus === 'draft' && (
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700">
            <FileText className="h-3.5 w-3.5" />
            Draft application
          </div>
        )}
      </div>

      <div className="mx-auto flex items-start justify-center overflow-hidden py-10">
        {steps.map((s, index) => (
          <div key={s.id} className="flex items-start">
            <button
              type="button"
              disabled={step < s.id}
              onClick={() => {
                if (step > s.id) {
                  setStep(s.id);
                }
              }}
              className="flex w-24 flex-col items-center gap-2 md:w-28 lg:w-28"
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-all md:h-9 md:w-9 lg:h-10 lg:w-10 ${
                  step > s.id
                    ? 'cursor-pointer bg-green-500 text-white'
                    : step === s.id
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
                      : 'cursor-not-allowed bg-gray-100 text-gray-400'
                }`}
              >
                {step > s.id ? <Check className="h-5 w-5" /> : s.id}
              </div>

              <span
                className={`text-center text-[8px] font-semibold leading-tight sm:text-[10px] md:text-xs lg:text-xs ${
                  step === s.id ? 'text-orange-500' : 'text-gray-400'
                }`}
              >
                {s.title}
              </span>
            </button>

            {index < steps.length - 1 && (
              <div
                className={`mx-1 mt-5 h-0.5 w-5 transition-colors sm:w-20 md:w-35 lg:w-40 ${
                  step > s.id ? 'bg-green-400' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {step === 1 && (
        <form onSubmit={handleSubmit(onStep1Submit)} className="space-y-0">
          <div className="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm">
            <div className="bg-linear-to-r from-orange-500 to-red-600 px-6 py-5">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-white" />

                <h2 className="font-bold text-white">Personal Information</h2>
              </div>

              <p className="mt-1 text-xs text-orange-100">
                Fill in your personal details accurately
              </p>
            </div>

            <div className="space-y-6 p-6">
              <div className="flex items-center gap-5 rounded-lg border border-orange-100 bg-orange-50 p-4">
                <Label className="flex h-20 w-20 shrink-0 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-orange-300 bg-white transition-colors hover:bg-orange-50">
                  {docs.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={docs.photoUrl}
                      alt="Profile"
                      className="h-full w-full rounded-lg object-contain"
                    />
                  ) : uploadingKeys.has('photo') ? (
                    <ShieldSpinLoader size={26} color="text-orange-500" />
                  ) : (
                    <Camera className="h-6 w-6 text-orange-400" />
                  )}

                  <Input
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(event) =>
                      handleFileChange(event, 'photoUrl', 'photo', 'Photo')
                    }
                  />
                </Label>

                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Profile Photo
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    JPG or PNG, max 2 MB. Clear face photo required.
                  </p>
                  {docs.photoUrl && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-green-600">
                      <CheckCircle className="h-3 w-3" />
                      Uploaded
                    </p>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-5">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-900">
                  <User className="h-4 w-4 text-orange-500" />
                  Basic Information
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    First Name *
                  </Label>
                  <Input
                    {...register('firstName')}
                    placeholder="e.g. Juan"
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm"
                  />
                  {errors.firstName && (
                    <FieldError>{errors.firstName.message}</FieldError>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Middle Name *
                  </Label>
                  <Input
                    {...register('middleName')}
                    placeholder="e.g. Santos"
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm"
                  />
                  {errors.middleName && (
                    <FieldError>{errors.middleName.message}</FieldError>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Last Name *
                  </Label>
                  <Input
                    {...register('lastName')}
                    placeholder="e.g. Dela Cruz"
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm"
                  />
                  {errors.lastName && (
                    <FieldError>{errors.lastName.message}</FieldError>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Gender *
                  </Label>
                  <Controller
                    control={control}
                    name="gender"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm">
                          <SelectValue placeholder="Select your gender..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Select your gender...</SelectLabel>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Prefer not to say">
                              Prefer not to say
                            </SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.gender && (
                    <FieldError>{errors.gender.message}</FieldError>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Age *
                  </Label>
                  <Input
                    type="number"
                    min={18}
                    max={70}
                    placeholder="21"
                    {...register('age', {
                      setValueAs: (value) =>
                        value === '' ? undefined : Number(value),
                    })}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm"
                  />
                  {errors.age && <FieldError>{errors.age.message}</FieldError>}
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Date of Birth *
                  </Label>
                  <Controller
                    control={control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            className={cn(
                              'w-full justify-start rounded-lg border-gray-200 bg-gray-50 text-left font-normal hover:bg-gray-100',
                              !field.value && 'text-muted-foreground',
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? (
                              format(
                                parse(field.value, 'yyyy-MM-dd', new Date()),
                                'PPP',
                              )
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={
                              field.value
                                ? parse(field.value, 'yyyy-MM-dd', new Date())
                                : undefined
                            }
                            onSelect={(date) => {
                              if (!date) {
                                field.onChange('');
                                return;
                              }
                              const year = date.getFullYear();
                              const month = String(
                                date.getMonth() + 1,
                              ).padStart(2, '0');
                              const day = String(date.getDate()).padStart(
                                2,
                                '0',
                              );

                              field.onChange(`${year}-${month}-${day}`);
                            }}
                            captionLayout="dropdown"
                            disabled={(date) => date > new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                    )}
                  />
                  {errors.dateOfBirth && (
                    <FieldError>{errors.dateOfBirth.message}</FieldError>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Nationality *
                  </Label>
                  <Input
                    {...register('nationality')}
                    placeholder="Filipino"
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm"
                  />
                  {errors.nationality && (
                    <FieldError>{errors.nationality.message}</FieldError>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Native Language *
                  </Label>
                  <Input
                    {...register('nativePlace')}
                    placeholder="e.g. Tagalog"
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm"
                  />
                  {errors.nativePlace && (
                    <FieldError>{errors.nativePlace.message}</FieldError>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Education Level *
                  </Label>
                  <Controller
                    control={control}
                    name="educationLevel"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm">
                          <SelectValue placeholder="Select your education level..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>
                              Select your education level...
                            </SelectLabel>
                            <SelectItem value="Elementary Level">
                              Elementary Level
                            </SelectItem>
                            <SelectItem value="High School Level">
                              High School Level
                            </SelectItem>
                            <SelectItem value="Senior High School Level">
                              Senior High School Level
                            </SelectItem>
                            <SelectItem value="College degree">
                              College degree
                            </SelectItem>
                            <SelectItem value="Masters degree">
                              Masters degree
                            </SelectItem>
                            <SelectItem value="Doctorate degree">
                              Doctorate degree
                            </SelectItem>
                            <SelectItem value="Vocational or Technical Certificates">
                              Vocational or Technical Certificates
                            </SelectItem>
                            <SelectItem value="Post-Secondary Non-Degree Programs">
                              Post-Secondary Non-Degree Programs
                            </SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.educationLevel && (
                    <FieldError>{errors.educationLevel.message}</FieldError>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Marital Status *
                  </Label>

                  <Controller
                    control={control}
                    name="maritalStatus"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm">
                          <SelectValue placeholder="Select your status..." />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Select your status...</SelectLabel>
                            <SelectItem value="Single">Single</SelectItem>
                            <SelectItem value="Married">Married</SelectItem>
                            <SelectItem value="Widowed">Widowed</SelectItem>
                            <SelectItem value="Separated">Annulment</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.maritalStatus && (
                    <FieldError>{errors.maritalStatus.message}</FieldError>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Employment Status *
                  </Label>
                  <Controller
                    control={control}
                    name="employmentStatus"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);

                          if (value === 'Unemployed') {
                            setValue('natureOfEmployment', '');
                            setValue('position', '');
                            setValue('employer', '');
                          }
                        }}
                      >
                        <SelectTrigger className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm">
                          <SelectValue placeholder="Select employment status..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>
                              Select employment status...
                            </SelectLabel>
                            <SelectItem value="Employed">Employed</SelectItem>
                            <SelectItem value="Unemployed">
                              Unemployed
                            </SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.employmentStatus && (
                    <FieldError>{errors.employmentStatus.message}</FieldError>
                  )}
                </div>

                {employmentStatus === 'Employed' && (
                  <>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Nature of Employment *
                      </Label>
                      <Controller
                        control={control}
                        name="natureOfEmployment"
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm">
                              <SelectValue placeholder="Select nature of employment..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>
                                  Select nature of employment...
                                </SelectLabel>
                                <SelectItem value="Self Employed / Business Owner">
                                  Self Employed / Business Owner
                                </SelectItem>
                                <SelectItem value="Government Employee">
                                  Government Employee
                                </SelectItem>
                                <SelectItem value="Part-Time / Job Order">
                                  Part-Time / Job Order
                                </SelectItem>
                                <SelectItem value="Contract of Service">
                                  Contract of Service
                                </SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.natureOfEmployment && (
                        <FieldError>
                          {errors.natureOfEmployment.message}
                        </FieldError>
                      )}
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Position *
                      </Label>
                      <Input
                        {...register('position')}
                        placeholder="e.g. Specialist"
                        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm"
                      />
                      {errors.position && (
                        <FieldError>{errors.position.message}</FieldError>
                      )}
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Employer&apos;s Name *
                      </Label>
                      <Input
                        {...register('employer')}
                        placeholder="e.g. Juan Dela Cruz Enterprises"
                        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm"
                      />
                      {errors.employer && (
                        <FieldError>{errors.employer.message}</FieldError>
                      )}
                    </div>
                  </>
                )}

                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Primary Prepared Role *
                  </Label>
                  <Controller
                    control={control}
                    name="primaryRole"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        disabled={availableRoles.length === 0}
                        onValueChange={(value) => {
                          field.onChange(value);

                          if (watch('secondaryRole') === value) {
                            setValue('secondaryRole', '');
                          }
                        }}
                      >
                        <SelectTrigger className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm">
                          <SelectValue
                            placeholder={
                              availableRoles.length === 0
                                ? 'No roles currently available...'
                                : 'Select primary role...'
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Select primary role...</SelectLabel>
                            {availableRoles.map((role) => (
                              <SelectItem key={role} value={role}>
                                {role}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.primaryRole && (
                    <FieldError>{errors.primaryRole.message}</FieldError>
                  )}
                  {availableRoles.length === 0 && (
                    <p className="mt-1 text-xs text-amber-600">
                      All volunteer roles are currently full or unavailable.
                      Please check back later or contact MDRRMO directly.
                    </p>
                  )}
                </div>

                {availableRoles.length != 1 && availableRoles.length != 0 && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Secondary Prepared Role *
                    </Label>
                    <Controller
                      control={control}
                      name="secondaryRole"
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          disabled={!primaryRole}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm">
                            <SelectValue
                              placeholder={
                                primaryRole
                                  ? 'Select secondary role...'
                                  : 'Select primary role first...'
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>
                                Select secondary role...
                              </SelectLabel>
                              {secondaryRoleOptions.map((role) => (
                                <SelectItem key={role} value={role}>
                                  {role}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      )}
                    />

                    {errors.secondaryRole && (
                      <FieldError>{errors.secondaryRole.message}</FieldError>
                    )}
                  </div>
                )}
              </div>

              <div className="border-t border-gray-100 pt-5">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-900">
                  <IdCard className="h-4 w-4 text-orange-500" />
                  Identification
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    ID Number *
                  </Label>
                  <Input
                    {...register('idNumber')}
                    placeholder="XXX-XXXX-XXX-XXX"
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 font-mono text-sm"
                  />
                  {errors.idNumber && (
                    <FieldError>{errors.idNumber.message}</FieldError>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    ID Card Type *
                  </Label>
                  <Controller
                    control={control}
                    name="idCardType"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm">
                          <SelectValue placeholder="Select card type..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Card Type</SelectLabel>
                            <SelectItem value="National ID">
                              National ID
                            </SelectItem>
                            <SelectItem value="Voter's ID">
                              Voter&apos;s ID
                            </SelectItem>
                            <SelectItem value="Driver's License">
                              Driver&apos;s License
                            </SelectItem>
                            <SelectItem value="Passport">Passport</SelectItem>
                            <SelectItem value="SSS ID">
                              SSS ID / GSIS ID
                            </SelectItem>
                            <SelectItem value="PhilHealth ID">
                              PhilHealth ID
                            </SelectItem>
                            <SelectItem value="Postal ID">Postal ID</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )}
                  />

                  {errors.idCardType && (
                    <FieldError>{errors.idCardType.message}</FieldError>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-5">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-900">
                  <MapPinHouse className="h-4 w-4 text-orange-500" />
                  Contact & Address
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-1.5 sm:col-span-3">
                  <Label className="text-sm font-medium text-gray-700">
                    Complete Address *
                  </Label>
                  <Textarea
                    {...register('completeAddress')}
                    placeholder="House/Building No., Street, Purok/Sitio, and other address details"
                    className="min-h-24 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm"
                  />
                  {errors.completeAddress && (
                    <FieldError>{errors.completeAddress.message}</FieldError>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Province *
                  </Label>

                  <Controller
                    control={control}
                    name="provinceCode"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                          setValue('municipalityCode', '');
                          setValue('barangayCode', '');
                        }}
                      >
                        <SelectTrigger className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm">
                          <SelectValue placeholder="Select province..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Select province...</SelectLabel>
                            {provinces.map((province) => (
                              <SelectItem
                                key={province.psgcCode}
                                value={province.psgcCode}
                              >
                                {String(province.provName)}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.provinceCode && (
                    <FieldError>{errors.provinceCode.message}</FieldError>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Municipality / City *
                  </Label>

                  <Controller
                    control={control}
                    name="municipalityCode"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        disabled={!provinceCode}
                        onValueChange={(value) => {
                          field.onChange(value);

                          setValue('barangayCode', '');
                        }}
                      >
                        <SelectTrigger className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm">
                          <SelectValue
                            placeholder={
                              provinceCode
                                ? 'Select municipality/city...'
                                : 'Select province first...'
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>
                              Select municipality/city...
                            </SelectLabel>

                            {filteredMunicipalities.map((municipality) => (
                              <SelectItem
                                key={municipality.psgcCode}
                                value={municipality.psgcCode}
                              >
                                {String(municipality.munCityName)}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )}
                  />

                  {errors.municipalityCode && (
                    <FieldError>{errors.municipalityCode.message}</FieldError>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Barangay *
                  </Label>

                  <Controller
                    control={control}
                    name="barangayCode"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        disabled={!municipalityCode}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm">
                          <SelectValue
                            placeholder={
                              municipalityCode
                                ? 'Select barangay...'
                                : 'Select municipality first...'
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Select barangay...</SelectLabel>
                            {filteredBarangays.map((barangay) => (
                              <SelectItem
                                key={barangay.psgcCode}
                                value={barangay.psgcCode}
                              >
                                {String(barangay.brgyName)}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )}
                  />

                  {errors.barangayCode && (
                    <FieldError>{errors.barangayCode.message}</FieldError>
                  )}
                </div>

                <div>
                  <Label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                    <Phone className="h-3.5 w-3.5" />
                    Contact Number *
                  </Label>
                  <Input
                    {...register('contactNumber')}
                    placeholder="09XXXXXXXXX"
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm"
                  />
                  {errors.contactNumber && (
                    <FieldError>{errors.contactNumber.message}</FieldError>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Telephone{' '}
                    <span className="text-orange-400">(Optional)</span>
                  </Label>

                  <Input
                    {...register('homePhone')}
                    placeholder="(042) XXX-XXXX"
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm"
                  />

                  {errors.homePhone && (
                    <FieldError>{errors.homePhone.message}</FieldError>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Email Address *
                  </Label>

                  <Input
                    {...register('email')}
                    placeholder="e.g. you@gmail.com"
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm"
                  />
                  {errors.email && (
                    <FieldError>{errors.email.message}</FieldError>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-5">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-900">
                  <Heart className="h-4 w-4 text-orange-500" />
                  Emergency Contact
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormInput
                    label="Full Name *"
                    placeholder="Contact person name"
                    error={errors.emergencyName?.message}
                    {...register('emergencyName')}
                  />
                  <FormInput
                    label="Relation *"
                    placeholder="e.g. Parent, Sibling"
                    error={errors.emergencyRelation?.message}
                    {...register('emergencyRelation')}
                  />
                  <FormInput
                    label="Contact Number *"
                    placeholder="09XXXXXXXXX"
                    error={errors.emergencyContact?.message}
                    {...register('emergencyContact')}
                  />
                  <FormInput
                    label="Address *"
                    placeholder="e.g. Poblacion, Mansalay"
                    error={errors.emergencyAddress?.message}
                    {...register('emergencyAddress')}
                  />
                </div>
              </div>

              <div className="border-t border-gray-100 pt-5">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-900">
                  <Workflow className="h-4 w-4 text-orange-500" />
                  Experience
                </h3>

                <Label className="text-sm font-medium text-gray-700">
                  Volunteering Experience{' '}
                  <span className="text-orange-400">(Optional)</span>
                </Label>

                <Textarea
                  {...register('volunteeringExperience')}
                  placeholder={
                    'e.g. 2022 – BFP Auxiliary Firefighter, Municipality of XYZ\n2021 – Red Cross Youth Chapter, Barangay ABC'
                  }
                  className="mt-1.5 min-h-28 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm"
                />
                {errors.volunteeringExperience && (
                  <FieldError>
                    {errors.volunteeringExperience.message}
                  </FieldError>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
              <button
                type="button"
                onClick={() => router.push('/profile')}
                className="flex items-center gap-2 rounded-lg hover:cursor-pointer bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>

              <button
                type="submit"
                className="flex items-center gap-2 rounded-lg bg-orange-500 hover:cursor-pointer px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-200 transition-colors hover:bg-orange-600"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </form>
      )}

      {step === 2 && (
        <div className="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm">
          <div className="bg-linear-to-r from-orange-500 to-red-600 px-6 py-5">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-white" />

              <h2 className="font-bold text-white">Upload Documents</h2>
            </div>

            <p className="mt-1 text-xs text-orange-100">
              Upload required documents for verification
            </p>
          </div>

          <div className="space-y-4 p-4 sm:p-6">
            <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

              <p className="text-xs text-blue-700 sm:text-sm">
                All documents must be clear and legible. Accepted formats: JPG
                and PNG. Maximum file size: 5 MB each.
              </p>
            </div>

            {documentTypes.map((doc) => {
              let isComplete = false;
              let completedLabel = 'Uploaded';

              if (doc.kind === 'sides') {
                isComplete = Boolean(docs[doc.front.key] && docs[doc.back.key]);
              } else {
                isComplete = docs[doc.key].length > 0;

                completedLabel = `${docs[doc.key].length} uploaded`;
              }

              return (
                <div
                  key={doc.label}
                  className="rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-orange-200 hover:shadow-sm sm:p-5"
                >
                  <div className="flex items-start justify-between gap-3 sm:gap-4">
                    <div className="flex min-w-0 flex-1 gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-50 sm:h-11 sm:w-11 sm:rounded-lg">
                        <doc.icon className="h-5 w-5 text-orange-500" />
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-xs font-bold text-gray-900 sm:text-sm">
                            {doc.label}
                          </h3>

                          {doc.required && (
                            <span className="rounded-full bg-red-50 px-2 py-0.5 text-[8px] font-bold text-red-500 sm:text-xs">
                              Required
                            </span>
                          )}

                          {isComplete && (
                            <span className="flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-[8px] font-semibold text-green-600 sm:text-xs">
                              <CheckCircle className="h-3.5 w-3.5" />
                              {completedLabel}
                            </span>
                          )}
                        </div>

                        <p className="mt-1 text-xs leading-5 text-gray-500 sm:text-sm">
                          {doc.desc}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 sm:mt-5">
                    {doc.kind === 'sides' && (
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <SingleUploadSlot
                          label={doc.front.label}
                          compact
                          url={docs[doc.front.key]}
                          uploading={uploadingKeys.has(doc.front.uploadType)}
                          onChange={(event) =>
                            handleFileChange(
                              event,
                              doc.front.key,
                              doc.front.uploadType,
                              `${doc.label} (${doc.front.label})`,
                            )
                          }
                        />

                        <SingleUploadSlot
                          label={doc.back.label}
                          compact
                          url={docs[doc.back.key]}
                          uploading={uploadingKeys.has(doc.back.uploadType)}
                          onChange={(event) =>
                            handleFileChange(
                              event,
                              doc.back.key,
                              doc.back.uploadType,
                              `${doc.label} (${doc.back.label})`,
                            )
                          }
                        />
                      </div>
                    )}

                    {doc.kind === 'multiple' && (
                      <MultiUploadSlot
                        urls={docs[doc.key]}
                        uploading={uploadingKeys.has(doc.uploadType)}
                        max={MAX_MULTI_FILES}
                        itemLabel={doc.itemLabel}
                        onAdd={(event) =>
                          handleMultiFileChange(event, doc.key, doc.uploadType)
                        }
                        onRemove={(url) => removeMultiFile(doc.key, url)}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex items-center gap-2 rounded-lg hover:cursor-pointer bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </button>

            <button
              type="button"
              onClick={() => {
                const missing = getMissingDocumentMessage();

                if (missing) {
                  toast.error(missing);

                  return;
                }

                setStep(3);
              }}
              className="flex items-center gap-2 rounded-lg hover:cursor-pointer bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-200 transition-colors hover:bg-orange-600"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {step === 3 && step1Data && (
        <div className="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm">
          <div className="bg-linear-to-r from-green-500 to-emerald-600 px-6 py-5">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-white" />

              <h2 className="font-bold text-white">Review & Submit</h2>
            </div>

            <p className="mt-1 text-xs text-green-100">
              Please review your information before submitting
            </p>
          </div>

          <div className="space-y-5 p-6">
            <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
              <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />

              <div>
                <p className="text-sm font-semibold text-green-800">
                  Your application is ready to submit
                </p>

                <p className="mt-0.5 text-xs text-green-600">
                  MDRRMO staff will review within 3–5 business days. You will be
                  notified by email.
                </p>
              </div>
            </div>

            <ReviewSection
              title="Basic Information"
              icon={User}
              items={[
                {
                  label: 'First Name',
                  value: step1Data.firstName,
                },
                {
                  label: 'Middle Name',
                  value: step1Data.middleName,
                },
                {
                  label: 'Last Name',
                  value: step1Data.lastName,
                },
                {
                  label: 'Gender',
                  value: step1Data.gender,
                },
                {
                  label: 'Age',
                  value: step1Data.age ? `${step1Data.age} years old` : '—',
                },
                {
                  label: 'Date of Birth',
                  value: step1Data.dateOfBirth,
                },
                {
                  label: 'Nationality',
                  value: step1Data.nationality,
                },
                {
                  label: 'Native Language',
                  value: step1Data.nativePlace,
                },
                {
                  label: 'Education',
                  value: step1Data.educationLevel,
                },

                {
                  label: 'Marital Status',
                  value: step1Data.maritalStatus,
                },
                {
                  label: 'Employment Status',
                  value: step1Data.employmentStatus,
                },
                {
                  label: 'Primary Role',
                  value: step1Data.primaryRole,
                },
                {
                  label: 'Secondary Role',
                  value: step1Data.secondaryRole,
                },
              ]}
            />

            {step1Data.employmentStatus === 'Employed' && (
              <ReviewSection
                title="Employment"
                icon={Workflow}
                items={[
                  {
                    label: 'Nature of Employment',
                    value: step1Data.natureOfEmployment,
                  },
                  {
                    label: 'Position',
                    value: step1Data.position,
                  },
                  {
                    label: 'Employer',
                    value: step1Data.employer,
                  },
                ]}
              />
            )}

            <ReviewSection
              title="Identification"
              icon={IdCard}
              items={[
                {
                  label: 'ID Number',
                  value: step1Data.idNumber,
                },
                {
                  label: 'ID Type',
                  value: step1Data.idCardType,
                },
              ]}
            />

            <ReviewSection
              title="Contact & Address"
              icon={MapPinHouse}
              items={[
                {
                  label: 'Complete Address',
                  value: step1Data.completeAddress,
                },
                {
                  label: 'Barangay',
                  value: selectedBarangay?.brgyName,
                },
                {
                  label: 'Municipality / City',
                  value: selectedMunicipality?.munCityName,
                },
                {
                  label: 'Province',
                  value: selectedProvince?.provName,
                },
                {
                  label: 'Contact Number',
                  value: step1Data.contactNumber,
                },
                {
                  label: 'Home Phone',
                  value: step1Data.homePhone,
                },
                {
                  label: 'Email Address',
                  value: step1Data.email,
                },
              ]}
            />

            <ReviewSection
              title="Emergency Contact"
              icon={Heart}
              items={[
                {
                  label: 'Name',
                  value: step1Data.emergencyName,
                },
                {
                  label: 'Relation',
                  value: step1Data.emergencyRelation,
                },
                {
                  label: 'Contact',
                  value: step1Data.emergencyContact,
                },
                {
                  label: 'Address',
                  value: step1Data.emergencyAddress,
                },
              ]}
            />

            <ReviewSection
              title="Experience"
              icon={Workflow}
              items={[
                {
                  label: 'Volunteering Experience',
                  value: step1Data.volunteeringExperience,
                },
              ]}
            />

            <div className="rounded-lg bg-gray-50 p-4">
              <div className="mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-orange-500" />

                <span className="text-sm font-bold text-gray-900">
                  Submitted Documents
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  {
                    label: 'Valid ID (Front & Back)',
                    done: Boolean(docs.validIdFrontUrl && docs.validIdBackUrl),
                  },
                  {
                    label: docs.trainingCertUrls.length
                      ? `Training Cert (${docs.trainingCertUrls.length})`
                      : 'Training Cert',
                    done: docs.trainingCertUrls.length > 0,
                  },
                ].map((document) => (
                  <div
                    key={document.label}
                    className={`flex items-center gap-1.5 rounded-lg p-2.5 ${
                      document.done ? 'bg-green-100' : 'bg-gray-100'
                    }`}
                  >
                    <CheckCircle
                      className={`h-3.5 w-3.5 ${
                        document.done ? 'text-green-600' : 'text-gray-400'
                      }`}
                    />

                    <span
                      className={`text-xs font-medium ${
                        document.done ? 'text-green-700' : 'text-gray-400'
                      }`}
                    >
                      {document.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={certified}
                onChange={(event) => setCertified(event.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
              />

              <span className="text-sm text-gray-600">
                I certify that all information provided is true and correct. I
                understand that providing false information may result in the
                rejection or cancellation of my application.
              </span>
            </label>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-gray-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="flex items-center justify-center gap-2 hover:cursor-pointer rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </button>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={onSaveDraft}
                disabled={isSubmitting || isSubmitting}
                className="flex items-center justify-center gap-2 hover:cursor-pointer rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:border-orange-300 hover:text-orange-600 disabled:opacity-70"
              >
                {isDraftSaving ? (
                  <ShieldSpinLoader size={18} color="text-gray-600" />
                ) : (
                  <FileText className="h-4 w-4" />
                )}
                {isDraftSaving ? 'Saving...' : ' Save as Draft'}
              </button>

              <button
                type="button"
                onClick={onFinalSubmit}
                disabled={isSubmitting || !certified || isDraftSaving}
                className="flex items-center justify-center gap-2 rounded-lg hover:cursor-pointer bg-green-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-green-200 transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? (
                  <ShieldSpinLoader size={20} color="text-white" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}

                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FieldError({ children }: { children: string | undefined }) {
  if (!children) {
    return null;
  }
  return <p className="mt-1 text-xs text-red-600">{children}</p>;
}

type FormInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

const FormInput = ({ label, error, ...props }: FormInputProps) => {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-gray-700">{label}</Label>
      <Input
        {...props}
        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm"
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
};

type ReviewSectionProps = {
  title: string;
  icon: React.ComponentType<{
    className?: string;
  }>;
  items: {
    label: string;
    value: string | number | null | undefined;
  }[];
};

function ReviewSection({ title, icon: Icon, items }: ReviewSectionProps) {
  return (
    <div className="rounded-lg bg-gray-50 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-4 w-4 text-orange-500" />

        <span className="text-sm font-bold text-gray-900">{title}</span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((item) => (
          <div key={item.label} className="min-w-0">
            <p className="text-xs text-gray-400">{item.label}</p>

            <p className="mt-0.5 wrap-break-word text-sm font-medium text-gray-800">
              {item.value || '—'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SingleUploadSlot({
  url,
  label,
  compact,
  uploading,
  onChange,
}: SingleUploadSlotProps) {
  if (uploading) {
    return (
      <div
        className={`flex ${
          compact ? 'h-24' : 'h-32'
        } w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-orange-200 bg-orange-50/50 text-center`}
      >
        <ShieldSpinLoader size={26} color="text-orange-500" />

        <p className="mt-2 text-sm font-medium text-orange-600">Uploading...</p>
      </div>
    );
  }

  if (url) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-green-100 bg-green-50 px-4 py-3">
        <CheckCircle className="h-5 w-5 shrink-0 text-green-500" />

        <div className="flex-1 overflow-hidden">
          {label && (
            <p className="text-[11px] font-semibold uppercase tracking-wide text-green-700/70">
              {label}
            </p>
          )}

          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 truncate text-[10px] font-medium text-green-700 hover:text-orange-600 sm:text-sm"
          >
            View document
            <ExternalLink className="h-3.5 w-3.5 shrink-0" />
          </a>
        </div>

        <label className="shrink-0 cursor-pointer rounded-lg border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600 transition hover:border-orange-300 hover:text-orange-600">
          Replace
          <input
            type="file"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={onChange}
          />
        </label>
      </div>
    );
  }

  return (
    <label
      className={`flex ${
        compact ? 'h-24' : 'h-32'
      } w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 text-center transition-all hover:border-orange-300 hover:bg-orange-50`}
    >
      <Upload className="mb-2 h-6 w-6 text-gray-300" />

      {label && (
        <p className="mb-0.5 text-xs font-semibold text-gray-600">{label}</p>
      )}

      <p className="px-2 text-sm text-gray-500">
        Drag & drop or{' '}
        <span className="font-semibold text-orange-500">browse</span>
      </p>

      <p className="mt-1 text-xs text-gray-400">JPG, PNG • Max 5 MB</p>

      <input
        type="file"
        className="hidden"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={onChange}
      />
    </label>
  );
}

function MultiUploadSlot({
  urls,
  uploading,
  max,
  itemLabel,
  onAdd,
  onRemove,
}: MultiUploadSlotProps) {
  const canAddMore = urls.length < max;

  return (
    <div className="space-y-3">
      {urls.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {urls.map((url, index) => (
            <div
              key={url}
              className="flex items-center gap-2 overflow-hidden rounded-lg border border-green-100 bg-green-50 p-1"
            >
              <CheckCircle className="h-4 w-4 shrink-0 text-green-500" />

              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 truncate text-[10px] font-medium text-green-700 hover:text-orange-600 sm:text-sm"
              >
                {itemLabel} {index + 1}
              </a>

              <button
                type="button"
                onClick={() => onRemove(url)}
                aria-label={`Remove ${itemLabel.toLowerCase()} ${index + 1}`}
                className="shrink-0 rounded-full p-1 text-green-400 hover:cursor-pointer transition-colors hover:bg-green-100 hover:text-red-500"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {canAddMore &&
        (uploading ? (
          <div className="flex h-24 w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-orange-200 bg-orange-50/50 text-center">
            <ShieldSpinLoader size={26} color="text-orange-500" />

            <p className="mt-1.5 text-xs font-medium text-orange-600">
              Uploading...
            </p>
          </div>
        ) : (
          <label className="flex h-24 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 text-center transition-all hover:border-orange-300 hover:bg-orange-50">
            <Upload className="mb-1.5 h-5 w-5 text-gray-300" />

            <p className="text-xs text-gray-500">
              {urls.length > 0 ? (
                <>
                  Add another{' '}
                  <span className="font-semibold text-orange-500">file</span>
                </>
              ) : (
                <>
                  Drag & drop or{' '}
                  <span className="font-semibold text-orange-500">
                    browse files
                  </span>
                </>
              )}
            </p>

            <p className="mt-1 text-[11px] text-gray-400">
              Up to {max} files • JPG, PNG
            </p>

            <input
              type="file"
              multiple
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={onAdd}
            />
          </label>
        ))}
    </div>
  );
}
