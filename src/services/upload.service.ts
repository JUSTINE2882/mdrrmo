export async function uploadFileServices(file: File, type: string) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);

  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  return res;
}
