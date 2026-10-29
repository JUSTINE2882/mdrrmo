import { statusConfig } from '@/data/status';
import useVolunteerApplicationPreview from '@/hooks/use-volunteer-application-preview';
import { listBarangays, listMuncities, listProvinces } from '@/lib/psgc';
import {
  ApplicationPreviewModalProps,
  CategoryProps,
  DocumentSet,
  DocumentThumbProps,
} from '@/types';
import {
  Camera,
  ChevronRight,
  ExternalLink,
  FileText,
  Heart,
  IdCard,
  MapPinHouse,
  User,
  Workflow,
  X,
} from 'lucide-react';
import { useEffect } from 'react';
import { ShieldSpinLoader } from '../custom/loading';

export function ApplicationPreview() {
  const {
    openPreview,
    previewData,
    previewLoading,
    showPreview,
    setShowPreview,
  } = useVolunteerApplicationPreview();

  return (
    <>
      <button
        type="button"
        onClick={openPreview}
        className="flex gap-1 items-center justify-center w-full text-center hover:cursor-pointer text-green-700 text-sm font-semibold"
      >
        Review Application <ChevronRight className="h-3.5 w-3.5" />
      </button>

      {showPreview && (
        <ApplicationPreviewModal
          data={previewData}
          loading={previewLoading}
          onClose={() => setShowPreview(false)}
        />
      )}
    </>
  );
}

function ApplicationPreviewModal({
  data,
  loading,
  onClose,
}: ApplicationPreviewModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const province = listProvinces().find(
    (province) => province.psgcCode === data?.provinceCode,
  );

  const municipality = listMuncities().find(
    (municipality) => municipality.psgcCode === data?.municipalityCode,
  );

  const barangay = listBarangays().find(
    (barangay) => barangay.psgcCode === data?.barangayCode,
  );

  const sections = data
    ? [
        {
          title: 'Basic Information',
          icon: User,
          items: [
            { l: 'First Name', v: data.firstName },
            { l: 'Middle Name', v: data.middleName },
            { l: 'Last Name', v: data.lastName },
            { l: 'Gender', v: data.gender },
            { l: 'Age', v: `${data.age} years old` },
            { l: 'Date of Birth', v: data.dateOfBirth },
            { l: 'Nationality', v: data.nationality },
            { l: 'Native Language', v: data.nativePlace },
            { l: 'Education', v: data.educationLevel },
            { l: 'Marital Status', v: data.maritalStatus },
            { l: 'Employment Status', v: data.employmentStatus },
            { l: 'Nature of Employment', v: data.natureOfEmployment },
            { l: 'Position', v: data.position },
            { l: 'Employer', v: data.employer },
            { l: 'Primary Role', v: data.primaryRole },
            { l: 'Secondary Role Role', v: data.secondaryRole },
          ],
        },
        {
          title: 'Identification',
          icon: IdCard,
          items: [
            { l: 'ID Number', v: data.idNumber },
            { l: 'ID Type', v: data.idCardType },
          ],
        },
        {
          title: 'Contact & Address',
          icon: MapPinHouse,
          items: [
            { l: 'Complete Address', v: data.completeAddress },
            { l: 'Barangay', v: barangay?.brgyName },
            { l: 'Municipality', v: municipality?.munCityName },
            { l: 'Province', v: province?.provName },
            { l: 'Contact Number', v: data.contactNumber },
            { l: 'Home Phone', v: data.homePhone },
            { l: 'Email Address', v: data.email },
          ],
        },
        {
          title: 'Emergency Contact',
          icon: Heart,
          items: [
            { l: 'Name', v: data.emergencyContact?.name },
            { l: 'Relation', v: data.emergencyContact?.relation },
            { l: 'Contact', v: data.emergencyContact?.contactNumber },
            { l: 'Address', v: data.emergencyContact?.address },
          ],
        },
        {
          title: 'Experience',
          icon: Workflow,
          items: [
            {
              l: 'Volunteering Experience',
              v: data.volunteeringExperience,
            },
          ],
        },
      ]
    : [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {data
                ? `${data.firstName} ${data.lastName}`
                : 'Application Preview'}
            </h2>
            {data && (
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${statusConfig[data.applicationStatus as keyof typeof statusConfig].class} `}
                >
                  {
                    statusConfig[
                      data.applicationStatus as keyof typeof statusConfig
                    ].label
                  }
                </span>
                {data.submittedAt ? (
                  <span className="text-xs text-gray-400">
                    Submitted{' '}
                    {new Date(data.submittedAt).toLocaleDateString('en-PH', {
                      dateStyle: 'long',
                    })}
                  </span>
                ) : null}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close preview"
            className="shrink-0 rounded-full p-1.5 hover:cursor-pointer text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-6">
          {loading && !data ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <ShieldSpinLoader size={26} color="text-orange-500" />
              <p className="text-sm text-gray-500">
                Loading your application...
              </p>
            </div>
          ) : data ? (
            <div className="space-y-5">
              {sections.map((section) => (
                <div key={section.title} className="rounded-lg bg-gray-50 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <section.icon className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-bold text-gray-900">
                      {section.title}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {section.items.map((item) => (
                      <div key={item.l}>
                        <p className="text-xs text-gray-400">{item.l}</p>
                        <p className="mt-0.5 text-sm font-medium text-gray-800">
                          {item.v || '—'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div className="mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-bold text-gray-900">
                  Documents
                </span>
              </div>
              <DocumentReview
                docs={{
                  photoUrl: data.photoUrl,
                  validIdFrontUrl: data.validIdFrontUrl,
                  validIdBackUrl: data.validIdBackUrl,
                  trainingCertUrls: data.trainingCertUrl,
                }}
              />
            </div>
          ) : (
            <p className="py-16 text-center text-sm text-gray-500">
              Couldn&apos;t load your application.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function isImageUrl(url: string) {
  return /\.(jpe?g|png|gif|webp|bmp)(\?.*)?$/i.test(url);
}

function DocumentThumb({ url, label }: DocumentThumbProps) {
  const isImage = isImageUrl(url);
  return (
    <div>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="group block overflow-hidden rounded-lg border border-gray-200 transition-colors hover:border-orange-300"
      >
        <div className="relative aspect-4/3 w-full bg-gray-100">
          {isImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt={label} className="h-24 w-full object-cover" />
          ) : (
            <div className="flex h-24 flex-col items-center justify-center gap-1.5 bg-gray-50">
              <FileText className="h-6 w-6 text-gray-400" />
              <span className="text-xs font-medium text-gray-500">
                PDF Document
              </span>
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
            <span className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-gray-900">
              <ExternalLink className="h-3.5 w-3.5" /> View full size
            </span>
          </div>
        </div>
        {label && (
          <div className="border-t border-gray-100 px-2.5 py-1.5 text-center text-xs font-medium text-gray-600">
            {label}
          </div>
        )}
      </a>
    </div>
  );
}

function DocumentCategory({
  icon: Icon,
  title,
  emptyText,
  documents,
}: CategoryProps) {
  return (
    <div className="rounded-lg bg-gray-50 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-4 w-4 text-orange-500" />
        <span className="text-sm font-bold text-gray-900">{title}</span>
      </div>
      {documents.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {documents.map((doc) => (
            <DocumentThumb key={doc.url} url={doc.url} label={doc.label} />
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-400">{emptyText}</p>
      )}
    </div>
  );
}

export function DocumentReview({ docs }: { docs: DocumentSet }) {
  const trainingCerts = docs.trainingCertUrls ?? [];

  return (
    <div className="space-y-4">
      <DocumentCategory
        icon={Camera}
        title="Profile Photo"
        emptyText="No profile photo on file."
        documents={
          docs.photoUrl ? [{ url: docs.photoUrl, label: 'Profile Photo' }] : []
        }
      />

      <DocumentCategory
        icon={IdCard}
        title="Valid Government ID"
        emptyText="No ID on file."
        documents={[
          ...(docs.validIdFrontUrl
            ? [{ url: docs.validIdFrontUrl, label: 'Front' }]
            : []),
          ...(docs.validIdBackUrl
            ? [{ url: docs.validIdBackUrl, label: 'Back' }]
            : []),
        ]}
      />

      <DocumentCategory
        icon={FileText}
        title={`Training Certificate${trainingCerts.length === 1 ? '' : 's'} (${trainingCerts.length})`}
        emptyText="No training certificates on file."
        documents={trainingCerts.map((url, i) => ({
          url,
          label: `Certificate ${i + 1}`,
        }))}
      />
    </div>
  );
}
