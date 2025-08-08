import { useParams } from "wouter";
import { CouponForm } from "@/components/forms/CouponForm";

export default function EditCouponPage() {
  const { id } = useParams();
  return (
    <div className="p-4 md:p-6">
      <CouponForm couponId={id} />
    </div>
  );
}