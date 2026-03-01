import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default function ReferralCodePage({ params }: { params: { code: string } }) {
  cookies().set({
    name: "ref_code",
    value: params.code.toUpperCase(),
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax",
    path: "/"
  });

  redirect(`/register?ref=${params.code.toUpperCase()}`);
}
