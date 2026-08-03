import { useState } from 'react';
import registrationFormSchema from '../validators/registrationValidator'
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
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Eye, Info } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import FormikErrorField from '@/components/formikFieldError';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';

import type { TsUserRegistrationDTO } from '../../../backend/src/controllers/tsUserController';
import apiClient from '@/lib/axiosClient';
import { useNavigate } from 'react-router-dom';

export default function RegisterExaminer() {
  const [passVisible, setPassVisible] = useState(false); 
  const navigate = useNavigate();
  const otpMut = useMutation({
    mutationFn: async (v: {email: string})  => await apiClient.post('/verification/email', v),
    onSuccess: () => toast.success('OTP sent.'),
    onError: () => toast.error('something went wrong.'),
  }) 

  const mut = useMutation({
    mutationFn: async (v: TsUserRegistrationDTO)  => await apiClient.post('/examiners', v),
    onSuccess: () => {
      toast.success('Registered Successfully.');
      navigate('/login/examiner');
    },
    onError: () => toast.error('something went wrong.'),
  }) 
  
  const fs = useFormik({
    initialValues: {
      salutation: '',                                                                                
      name: '',                                                                                                  
      department: '',                                                                                
      designation: '',
      yearOfExperience: 0,                                                                          
      aicteNo: '',                                                                                   
      annaUnivNo: '',                                                                                
      collegeName: '',                                                                               
      collegePlace: '',                                                                              
      collegePinCode: '',                                                                            
      idCardImage: null,                                                                       
      email: '',                                                                                     
      password: '',                                                                                  
      phone: '',                                                                                     
      otp: '',
      acknoledgement: false,
    },
    validationSchema: registrationFormSchema,
    onSubmit: async(vo) => {
      //TODO
      //messy register handler. imporve this
      const v = registrationFormSchema.cast(vo);
      
      if(! v.idCardImage) {
        return toast.error('Upload id card image.');
      }

      const formData = new FormData();
      formData.append('file', v.idCardImage);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/id-card-image`, {
        method: 'POST',
        body: formData
      })
      if(res.status !== 201) {
        return toast.error('Cannot upload image.');
      }
      const { fileName } = await res.json();

      const { idCardImage, acknoledgement, ...fields} = v;
      const payload: TsUserRegistrationDTO = {...fields, idCardImageFileName: fileName as string}

      //ATTENTION
      // cant get yup to tranform empty string to null. so doing it here
      payload.aicteNo = payload.aicteNo === '' ? null : payload.aicteNo
      payload.annaUnivNo = payload.annaUnivNo === '' ? null : payload.annaUnivNo;

      mut.mutate(payload)
    }
  });
  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle  className="text-center text-xl">Register as Examiner</CardTitle>
        </CardHeader>
        <Separator />

        <CardContent>
          <form className="space-y-8" onSubmit={fs.handleSubmit}>
            {/* Personal Details */}
            <section className="space-y-6">
              <h2 className="font-semibold">Personal Details</h2>

              <div>
                <div className="flex gap-2">
                  <div className="space-y-2">
                    <Label>Saluation</Label>
                    <Select
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
                      placeholder="Eg: John A"
                      value={fs.values.name}
                      onChange={(v) => fs.setFieldValue('name', v.target.value)}
                      onBlur={fs.handleBlur}
                    />
                  </div>
                </div>
                <FormikErrorField name='salutation' formikState={fs} />
                <FormikErrorField name='name' formikState={fs} />
              </div>

              <div className="space-y-2">
                <Label>Department</Label>
                <Select
                  value={fs.values.department}
                  onValueChange={(v) => {fs.setFieldValue('department', v)}}
                  onOpenChange={() => fs.setFieldTouched('department', true)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="Artificial Intelligence and Data Science">Artificial Intelligence and Data Science</SelectItem>
                    <SelectItem value="Civil Engineering">Civil Engineering</SelectItem>
                    <SelectItem value="Computer Science and Engineering">Computer Science and Engineering</SelectItem>
                    <SelectItem value="Computer Science and Engineering (Cyber Security)">Computer Science and Engineering (Cyber Security)</SelectItem>
                    <SelectItem value="Electrical and Electronics Engineering">Electrical and Electronics Engineering</SelectItem>
                    <SelectItem value="Electronics and Communication Engineering">Electronics and Communication Engineering</SelectItem>
                    <SelectItem value="Information Technology">Information Technology</SelectItem>
                    <SelectItem value="Mechanical Engineering">Mechanical Engineering</SelectItem>
                    <SelectItem value="Management Studies">Management Studies</SelectItem>
                    <SelectItem value="Computer Applications">Computer Applications</SelectItem>
                    <SelectItem value="Maths">Maths</SelectItem>
                    <SelectItem value="Physics">Physics</SelectItem>
                    <SelectItem value="Chemistry">Chemistry</SelectItem>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Tamil">Tamil</SelectItem>
                  </SelectContent>
                </Select>
                <FormikErrorField name='department' formikState={fs} />
              </div>

              <div className="space-y-2">
                <Label>Designation</Label>
                <Select
                  name='designation'
                  value={fs.values.designation}
                  onValueChange={(v) => fs.setFieldValue('designation', v)}
                  onOpenChange={() => fs.setFieldTouched('designation', true)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="Professor">Professor</SelectItem>
                    <SelectItem value="Associate Professor">Associate Professor</SelectItem>
                    <SelectItem value="Assistant Professor">Assistant Professor</SelectItem>
                  </SelectContent>
                </Select>
                <FormikErrorField name='designation' formikState={fs} />
              </div>

              <div className="space-y-2 grow">
                <Label htmlFor="yearOfExperience">Year of experience</Label>
                <Input
                  inputMode='numeric'
                  name="yearOfExperience"
                  value={fs.values.yearOfExperience}
                  onChange={(v) => {fs.setFieldValue('yearOfExperience', v.target.value)}}
                  onBlur={fs.handleBlur}
                />
                <FormikErrorField name='yearOfExperience' formikState={fs} />
              </div>

              <div className="space-y-2 grow">
                <div className='flex gap-1 items-center'>
                  <Label htmlFor="aicteNo">AICTE Number (Optional)</Label>
                  <Popover>
                    <PopoverTrigger>
                        <Info className='size-4 mx-1' />
                    </PopoverTrigger>
                    <PopoverContent align="start" side="right">
                      <p>
                        This is optional only for faculties those who have no AICTE number.<br />
                      </p>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className='flex gap-1 items-center'>
                  <Input value='1-' disabled className='w-10' />
                  <Input
                    name="aicteNo"
                    className='grow'
                    value={fs.values.aicteNo}
                    onChange={(v) => fs.setFieldValue('aicteNo', v.target.value)}
                    onBlur={fs.handleBlur}
                  />
                </div>
                <FormikErrorField name='aicteNo' formikState={fs} />
              </div>

              <div className="space-y-2 grow">
                <div className='flex gap-1'>
                <Label htmlFor="aicteNo">Anna University Faculty Identification Number (Optional)</Label>
                  <Popover>
                    <PopoverTrigger>
                        <Info className='size-4 mx-1' />
                    </PopoverTrigger>
                    <PopoverContent align="start" side="right">
                      <p>
                        This is optional only for faculties not under anna university.<br />
                        To find your Anna University Faculty Identification Number.
                        Visit the website of Anna University linked below, then 
                        choose 'Find your FIN' Button.
                      </p>
                       <a
                         target='_blank'
                         href='http://affiliations.annauniv.edu' className='underline'
                       >
                        Click Here 
                       </a>
                    </PopoverContent>
                  </Popover>
                </div>
                <Input
                  name="annaUnivNo"
                  value={fs.values.annaUnivNo}
                  onChange={(v) => fs.setFieldValue('annaUnivNo', v.target.value)}
                  onBlur={fs.handleBlur}
                />
                <FormikErrorField name='annaUnivNo' formikState={fs} />
              </div>

            </section>

            {/* WorkPlace */}
            <section className="space-y-6">
              <h2 className="font-semibold">College Details</h2>

                <div className="space-y-2">
                  <Label htmlFor="collegeName">College Name</Label>
                  <Input
                    name="collegeName"
                    value={fs.values.collegeName}
                    onChange={(v) => fs.setFieldValue('collegeName', v.target.value)}
                    onBlur={fs.handleBlur}
                  />
                  <FormikErrorField name='collegeName' formikState={fs} />
                </div>

                <div className="flex gap-2">
                  <div className="space-y-2 grow">
                    <Label htmlFor="collegePlace">College Place</Label>
                    <Input
                      name="collegePlace"
                      placeholder="Eg: Thiruchengode"
                      value={fs.values.collegePlace}
                      onChange={(v) => fs.setFieldValue('collegePlace', v.target.value)}
                      onBlur={fs.handleBlur}
                    />
                    <FormikErrorField name='collegePlace' formikState={fs} />
                  </div>
                  <div className="space-y-2 grow">
                    <Label htmlFor="collegePinCode">College Pincode</Label>
                    <Input
                      name="collegePinCode"
                      value={fs.values.collegePinCode}
                      onChange={(v) => fs.setFieldValue('collegePinCode', v.target.value)}
                      onBlur={fs.handleBlur}
                    />
                    <FormikErrorField name='collegePinCode' formikState={fs} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex">
                    <Label htmlFor="collegeIdCard">College Id Card Image</Label>
                    <Popover>
                      <PopoverTrigger>
                          <Info className='size-4 mx-1' />
                      </PopoverTrigger>
                      <PopoverContent align="start" side="right">
                        <p>
                        Upload a clear image of the ID card provided by your institution.
                        </p>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <Input
                    type="file"
                    name="idCardImage"
                    accept="image/png, image/jpeg"
                    onChange={(v) => fs.setFieldValue('idCardImage', v.currentTarget.files?.[0] ?? null)}
                    onBlur={fs.handleBlur}
                  />
                  <FormikErrorField name='idCardImage' formikState={fs} />
                </div>

            </section>

            {/* Contact */}
            <section className="space-y-6">
              <h2 className="font-semibold">Contact</h2>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <div className="flex items-baseline gap-2">
                    <span className="text-nowrap">+ 91</span>
                    <Input
                      name="phone"
                      value={fs.values.phone}
                      onChange={(v) => fs.setFieldValue('phone', v.target.value)}
                      onBlur={fs.handleBlur}
                    />
                  </div>
                  <FormikErrorField name='phone' formikState={fs} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    name="email"
                    type="email"
                    placeholder="name@domain.com"
                    value={fs.values.email}
                    onChange={(v) => fs.setFieldValue('email', v.target.value)}
                    onBlur={fs.handleBlur}
                  />
                  <FormikErrorField name='email' formikState={fs} />
                </div>

              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Password</Label>
                <div className='flex gap-1'>
                  <Input
                    name="password"
                    type={passVisible === true ? 'text' : 'password'}
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

              <div className="flex flex-col space-y-6">
                <Button
                  onClick={() => otpMut.mutate({ email: fs.values.email})}
                  disabled={!! fs.errors.email || fs.values.email === ''}
                  type="button"
                >
                  Verify Email By Sending OTP
                </Button>
                <div>
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
                  <FormikErrorField name='otp' formikState={fs} />
                </div>
              </div>
            </section>

            {/* Aknoledgement */}
            <section className="space-y-6">

              <div className="grid gap-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    name="acknoledgement"
                    checked={fs.values.acknoledgement}
                    onCheckedChange={(v) => fs.setFieldValue('acknoledgement', v)}
                  />

                  <div>
                    <Label htmlFor="acknoledgement">Acknoledgement</Label>

                    <p className="text-sm text-muted-foreground">
                    The details provided in this form are correct and error free. The appointment will be based on experience and expertise.
                    </p>
                  </div>
                </div>
                <FormikErrorField name='acknoledgement' formikState={fs} />

              </div>
            </section>

            {/* Actions */}
            <div className="flex justify-end gap-3 border-t pt-6">
              <Button onClick={() => fs.resetForm()} variant="outline" type="button">
                Clear
              </Button>

              <Button
                type="submit"
              >
                Register
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
