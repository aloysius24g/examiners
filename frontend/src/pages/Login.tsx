import { useFormik } from "formik";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { examinerLoginInputSchema, officerLoginInputSchema } from "@/validators/loginValidators";
import FormikErrorField from "@/components/formikFieldError";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import apiClient from "@/lib/axiosClient";
import { NavLink, useNavigate } from "react-router-dom";
import { useUserContext } from '../components/user-context';

import type { CredentialDTO, SessionDTO } from '../../../backend/src/controllers/sessionController';

export function ExaminerLoginPage() {

  const navigate = useNavigate();

  const userContext = useUserContext()

  const mut = useMutation({
    mutationFn: async (v: CredentialDTO) => {
      const res = await apiClient.post<SessionDTO>('/session', v);
      return res.data;
    }
  });

  const fs = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: examinerLoginInputSchema,
    onSubmit: vo => {
      const v = examinerLoginInputSchema.cast(vo);
      const apiCallPromise = mut.mutateAsync({accountType: 'TS', ...v});
      toast.promise(apiCallPromise, {
        loading: 'Logging in.',
        error: (e) => e.response?.data?.message ?? 'something went wrong',
        success: 'Logged In.'
      });
      apiCallPromise.then(v => navigate(`/examiners/${v.id}`));
      apiCallPromise.then(v => userContext.setData({
        ...v, expires: new Date(Date.now() + 28 * 60 * 1000)
      }));
    }
  });

  return (
    <div className="flex grow items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-3">
          <CardTitle className="text-center">Examiner Login</CardTitle>
          <Separator />
        </CardHeader>

        <CardContent>
          <form onSubmit={fs.handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Registered Email</Label>

              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Eg: abc@sxcce.edu.in"
                value={fs.values.email}
                onChange={fs.handleChange}
                onBlur={fs.handleBlur}
              />
              <FormikErrorField name="email" formikState={fs}/>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>

              <Input
                id="password"
                name="password"
                type="password"
                placeholder=""
                value={fs.values.password}
                onChange={fs.handleChange}
                onBlur={fs.handleBlur}
              />
              <FormikErrorField name="password" formikState={fs}/>
            </div>

            <Button type="submit" className="w-full">
              Login
            </Button>
            <div className="flex justify-center gap-2">
              Don't have an Account ?
              <NavLink
                to={'/register/examiner'}
                className='text-center hover:text-blue-400 font-bold underline cursor-pointer'
              >
                Register
              </NavLink>
            </div>
            <div className="flex justify-center gap-2">
              Forgot Password ?
              <NavLink
                to={'/password-reset/examiner'}
                className='text-center hover:text-blue-400 font-bold underline cursor-pointer'
              >
                Reset Password
              </NavLink>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export function OfficerLoginPage() {

  const navigate = useNavigate();
  const userContext = useUserContext()
  
  const mut = useMutation({
    mutationFn: async (v: CredentialDTO) => {
      const res = await apiClient.post<SessionDTO>('/session', v);
      return res.data;
    }
  });


  const fs = useFormik({
    initialValues: {
      userName: "",
      password: "",
    },
    validationSchema: officerLoginInputSchema,
    onSubmit: vo => {
      const v = officerLoginInputSchema.cast(vo);
      const apiCallPromise = mut.mutateAsync({accountType: 'NS', ...v});
      toast.promise(apiCallPromise, {
        loading: 'Logging in.',
        error: (e) => e.response?.data?.message ?? 'something went wrong',
        success: 'Logged In.'
      });
      apiCallPromise.then(_ => navigate(`/examiners`));
      apiCallPromise.then(v => userContext.setData({
        ...v, expires: new Date(Date.now() + 29 * 60 * 1000)
      }));
    }
  });

  return (
    <div className="flex grow items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-3">
          <CardTitle className="text-center">CoE Office Employee Login</CardTitle>
          <Separator />
        </CardHeader>

        <CardContent>
          <form onSubmit={fs.handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Username</Label>

              <Input
                id="userName"
                name="userName"
                type="text"
                value={fs.values.userName}
                onChange={fs.handleChange}
                onBlur={fs.handleBlur}
              />
              <FormikErrorField name="userName" formikState={fs}/>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>

              <Input
                id="password"
                name="password"
                type="password"
                placeholder=""
                value={fs.values.password}
                onChange={fs.handleChange}
                onBlur={fs.handleBlur}
              />
              <FormikErrorField name="password" formikState={fs}/>
            </div>

            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
