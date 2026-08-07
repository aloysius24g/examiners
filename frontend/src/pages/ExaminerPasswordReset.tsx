import { useMutation } from "@tanstack/react-query";
import { useFormik } from "formik";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import apiClient from "@/lib/axiosClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import FormikErrorField from "@/components/formikFieldError";
import passwordResetValidator from '../validators/passwordResetValidators';

import type { PasswordResetDTO } from '../../../backend/src/controllers/tsUserController';
import { useState } from "react";
import { Eye } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

export function ExaminerPasswordReset() {

  const [passVisible, setPassVisible] = useState(false);

  const navigate = useNavigate();

  const mut = useMutation({
    mutationFn: async (v: PasswordResetDTO) => {
      const res = await apiClient.put<undefined>(
        "/examiners/passwords",
        v
      );

      return res.data;
    },
  });

  const otpMut = useMutation({
    mutationFn: async (v: {email: string})  => await apiClient.post('/verification/email', v),
  }) 

  const fs = useFormik({
    initialValues: {
      email: "",
      newPassword: "",
      confirmNewPassword: "",
      otp: ""
    },
    validationSchema: passwordResetValidator, 
    onSubmit: vo => {
      const v = passwordResetValidator.cast(vo);
      const {confirmNewPassword, ...vf} = v;
      const apiCallPromise = mut.mutateAsync(vf);

      toast.promise(apiCallPromise, {
        loading: "Resetting password.",
        error: (e) =>
          e.response?.data?.message ?? "Something went wrong",
        success: "Password reset successfully.",
      });

      apiCallPromise.then(() => {
        navigate("/login/examiner");
      });
    },
  });

  return (
    <div className="flex grow items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-3">
          <CardTitle className="text-center">
            Examiner Password Reset
          </CardTitle>
          <Separator />
        </CardHeader>

        <CardContent>
          <form className="space-y-6">

            <div className="space-y-2">
              <Label htmlFor="email">
                Registered Email
              </Label>

              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Eg: abc@sxcce.edu.in"
                value={fs.values.email}
                onChange={fs.handleChange}
                onBlur={fs.handleBlur}
              />

              <FormikErrorField
                name="email"
                formikState={fs}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">
                New Password
              </Label>

              <div className='flex gap-1'>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type={passVisible === true ? 'text' : 'password'}
                  value={fs.values.newPassword}
                  onChange={fs.handleChange}
                  onBlur={fs.handleBlur}
                />
                  <Button
                    variant={passVisible === true ? 'default' : 'outline'}
                    type='button'
                    onClick={() => setPassVisible(pre => !pre)}
                  >
                    <Eye/>
                  </Button>
                </div>

              <FormikErrorField
                name="newPassword"
                formikState={fs}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmNewPassword">
                Confirm Password
              </Label>

                <Input
                  name="confirmNewPassword"
                  id="confirmNewPassword"
                  type="password"
                  value={fs.values.confirmNewPassword}
                  onChange={(v) => fs.setFieldValue('confirmNewPassword', v.target.value)}
                  onBlur={fs.handleBlur}
                />

              <FormikErrorField
                name="confirmNewPassword"
                formikState={fs}
              />
            </div>
            <div className="space-y-2">
              <Label>Verify Email and Enter OTP</Label>
              <div className="flex justify-between gap-3">
                <Button
                  className="grow"
                  onClick={() => {
                    const mutPromise = otpMut.mutateAsync({ email: fs.values.email})
                    toast.promise(mutPromise, {
                      loading: "Resetting password.",
                      error: (e) =>
                        e.response?.data?.message ?? "Something went wrong",
                      success: "Password reset successfully.",
                    })
                  }}
                  disabled={!! fs.errors.email || fs.values.email === ''}
                  type="button"
                >
                  Sent Otp
                </Button>
                <InputOTP
                name='otp'
                maxLength={6}
                value={fs.values.otp}
                onChange={(v) => fs.setFieldValue('otp', v)}
                onBlur={fs.handleBlur}
                >
                  <InputOTPGroup className="w-full flex justify-center">
                  <InputOTPSlot index={0}/>
                  <InputOTPSlot index={1}/>
                  <InputOTPSlot index={2}/>
                  <InputOTPSlot index={3}/>
                  <InputOTPSlot index={4}/>
                  <InputOTPSlot index={5}/>
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <FormikErrorField name='otp' formikState={fs} />
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button
            onClick={() => fs.handleSubmit()}
            type="submit"
            disabled={mut.isPending}
          >
            Reset Password
          </Button>
        </CardFooter>

      </Card>
    </div>
  );
}
