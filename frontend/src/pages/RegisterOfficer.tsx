import officerRegistrationValidator from '../validators/officerRegistrationValidator';
import { useFormik } from 'formik';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import FormikErrorField from '@/components/formikFieldError';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from '@/components/user-context';
import { abilitiesFor } from '@/permissions';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';

import type { NsUserRegistrationDTO } from '../../../backend/src/controllers/nsUserController';
import apiClient from '@/lib/axiosClient';
import { Eye } from 'lucide-react';

export default function RegisterOfficer() {

  const [passVisible, setPassVisible] = useState(false);

  const mut = useMutation({
    mutationFn: async (v: NsUserRegistrationDTO) => {
      const res = await apiClient.post<NsUserRegistrationDTO>('/officers', v);
      return res.data;
    }
  });

  const fs = useFormik({
    initialValues: {
      salutation: '',                                                                                
      name: '',                                                                                                  
      userName: '',
      roleName: '',
      password: '',                                                                                  
    },
    validationSchema: officerRegistrationValidator,
    onSubmit: (vo) => {
      const v = officerRegistrationValidator.cast(vo);
      const mutPromise = mut.mutateAsync(v);
      toast.promise(mutPromise, {
        loading: 'Creating account.',
        error: (e) => e.response?.data?.message ?? 'something went wrong',
        success: 'Account Created.'
      })
    }
  });

  const navigate = useNavigate();

  const userContext = useUserContext();
  //const ability = abilitiesFor(userContext.data)

  useEffect(() => {
    const ability = abilitiesFor(userContext.data)
    if(ability.cannot('create', 'officer')) {
      navigate('/login/examiner');
      toast.error('Not enough permission.');
    }
  }, [userContext.data])

  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle  className="text-center text-xl">Create Office User Account</CardTitle>
        </CardHeader>
        <Separator />

        <CardContent>
          <form className="space-y-8">

            {/* Personal Details */}
            <section className="space-y-6">
              <div>
                <div className="flex gap-2">
                  <div className="space-y-2">
                    <Label>Saluation</Label>
                    <Select
                      name='salutation'
                      value={fs.values.salutation}
                      onValueChange={(v) => fs.setFieldValue('salutation', v)}
                      onOpenChange={() => fs.setFieldTouched('salutation', true)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="Mr">Mr</SelectItem>
                        <SelectItem value="Ms">Ms</SelectItem>
                        <SelectItem value="Mrs">Mrs</SelectItem>
                        <SelectItem value="Dr">Dr</SelectItem>
                        <SelectItem value="Prof">Prof</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 grow">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      name="name"
                      placeholder="Eg: Aloysisus Priyan"
                      value={fs.values.name}
                      onChange={(v) => fs.setFieldValue('name', v.target.value)}
                      onBlur={fs.handleBlur}
                    />
                  </div>
                </div>
                <FormikErrorField name='salutation' formikState={fs} />
                <FormikErrorField name='name' formikState={fs} />
              </div>

              <div className="space-y-2 grow">
                <Label htmlFor="name">Username</Label>
                <Input
                  name="userName"
                  placeholder="Eg: Aloysius"
                  value={fs.values.userName}
                  onChange={(v) => fs.setFieldValue('userName', v.target.value)}
                  onBlur={fs.handleBlur}
                />
                <FormikErrorField name='userName' formikState={fs} />
              </div>

              <div className="space-y-2">
                <Label>Role Name</Label>
                <Select
                  name='roleName'
                  value={fs.values.roleName}
                  onValueChange={(v) => fs.setFieldValue('roleName', v)}
                  onOpenChange={() => fs.setFieldTouched('roleName', true)}
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="assistant">assistant</SelectItem>
                    <SelectItem value="coe">coe</SelectItem>
                  </SelectContent>
                </Select>
                <FormikErrorField name='roleName' formikState={fs} />
              </div>

              <div className="space-y-2 grow">
                <Label htmlFor="name">Password</Label>
                <div className='flex gap-1'>
                  <Input
                    name="password"
                    type={passVisible ? 'text' : 'password'}
                    value={fs.values.password}
                    onChange={(v) => fs.setFieldValue('password', v.target.value)}
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
                <FormikErrorField name='password' formikState={fs} />
              </div>

            </section>

            {/* Actions */}
            <div className="flex justify-end gap-3 border-t pt-6">
              <Button variant="outline" type="button">
                Clear
              </Button>

              <Button
                type="button"
                onClick={() => fs.handleSubmit()}
                disabled={mut.isPending}
              >
                Create
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
