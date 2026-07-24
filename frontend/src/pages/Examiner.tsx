import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { collegeValidator, contactValidator, personalInfoValidator } from "@/validators/examinerInfoValidators";
import { useFormik } from "formik";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FormikErrorField from "@/components/formikFieldError";
import { useUserContext } from "@/components/user-context";
import { abilitiesFor } from "@/permissions";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useMutation, useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/axiosClient";
import { queryClient } from "@/lib/queryClient";
import { MultiSelect } from "@/components/ui/multi-select";

import type { ContactDTO, WorkPlaceDTO } from '../../../backend/src/controllers/tsUserController';
import type { TsUserDetailedDTO, UpdatablePersonalInfoDTO } from '../../../backend/src/controllers/tsUserController';
import type { CourseDTO } from "../../../backend/src/controllers/courseController";
import { Switch } from "@/components/ui/switch";

const prefOptions = [
  {label: 'Setter', value:'questionSetter'},
  {label: 'Scrutinizer', value:'questionScrutinizer'},
  {label: 'Examiner Practical', value:'examinerPractical'},
  {label: 'Examiner Valuation', value:'examinerValuation'},
]

export default function Examiner() {

  const { id } = useParams();

  const query = useQuery({
    queryFn: async() => {
      const res = await apiClient.get<TsUserDetailedDTO>(`/examiners/${id}`)
      return res.data;
    },
    queryKey: ['examiner', id]
  });

  const verifiedMut = useMutation({
    mutationFn: async (v: {userVerified: boolean}) => {
      const res = await apiClient.put<{userVerified: boolean}>(`/examiners/${id}/verified`, v)
      return res.data;
    } 
  })

  const blacklistedMut = useMutation({
    mutationFn: async (v: {userBlacklisted: boolean}) => {
      const res = await apiClient.put<{userBlacklisted: boolean}>(`/examiners/${id}/blacklisted`, v)
      return res.data;
    } 
  })

  const navigate = useNavigate();

  const userContext = useUserContext();
  const ability = abilitiesFor(userContext.data)

  useEffect(() => {
    const ability = abilitiesFor(userContext.data)
    if(ability.cannot('view', {kind: 'examiner', id: Number(id)})) {
      navigate('/login/examiner');
      toast.error('Not enough permission.');
    }
  }, [userContext.data])

  if(query.isLoading) {
    return <h1>Loading...</h1>
  }
  if(! query.data) {
    return <h1>something went wrong</h1>
  }

  return <div className="space-y-6">

    {/* Private Fields */}
    <div className="flex gap-2">
      { ability.can('view', 'examinerAuthenticity') && (query.data.userVerified !== undefined) &&
       <Badge className={query.data.userVerified ? 'bg-green-400' : 'bg-yellow-400'} >
        {query.data.userVerified ? 'Verified' : 'Not Verified'}
       </Badge>
      }

      { ability.can('view', 'examinerPrivateFields') && (query.data.userBlacklisted) &&
       <Badge variant="destructive" >
        Blacklisted
       </Badge>
      }
    </div>

    {/*Actions on users*/}
    { ability.can('update', 'examinerAuthenticity') &&
      (query.data.userVerified !== undefined) && 
      (query.data.userBlacklisted !== undefined) &&
      <section className="space-y-4 max-w-260 mx-auto">
        <div className="flex justify-between">
          <span className="text-lg">
            Actions
          </span>
        </div>
        <div className="flex gap-3">
          <div className="px-8 border p-4 rounded-(--radius) flex flex-wrap gap-2">
            <Label htmlFor="verifiedBtn">Verified</Label>
            <Switch
              className="data-checked:bg-green-500"
              id="verifiedBtn"
              name="verified"
              checked={query.data.userVerified}
              onCheckedChange={v => {
                const mutPromise = verifiedMut.mutateAsync({userVerified: v});
                toast.promise(mutPromise, {
                  loading: 'Updating.',
                  success: 'Updated.',
                  error: (e) => e.response?.data?.message ?? 'something went wrong',
                })
                mutPromise.then(d =>
                  queryClient.setQueryData(['examiner', id], (old: object) => {
                    return {
                      ...old,
                      userVerified: d.userVerified
                    };
                  })
                );
              }}
            />
          </div>
          <div className="px-8 border p-4 rounded-(--radius) flex flex-wrap gap-2">
            <Label htmlFor="blacklistBtn">Blacklisted</Label>
            <Switch
              className="data-checked:bg-red-500"
              id="blacklistBtn"
              name="verified"
              checked={query.data.userBlacklisted}
              onCheckedChange={v => {
                const mutPromise = blacklistedMut.mutateAsync({userBlacklisted: v});
                toast.promise(mutPromise, {
                  loading: 'Updating.',
                  success: 'Updated.',
                  error: (e) => e.response?.data?.message ?? 'something went wrong',
                })
                mutPromise.then(d =>
                  queryClient.setQueryData(['examiner', id], (old:object) => {
                    return {
                      ...old,
                      userBlacklisted: d.userBlacklisted
                    };
                  })
                );
              }}
            />
          </div>
        </div>
      </section>
    }

    {/*Preferences*/}
    { ability.can('view', 'examinerPrivateFields') && (query.data.preferences) &&
      <section className="space-y-4 max-w-260 mx-auto">
        <div className="flex justify-between">
          <span className="text-lg">
            Preferences
          </span>
          { ability.can('update', 'examinerPreference') &&
            <Dialog>
              <DialogTrigger asChild>
                  <Button>
                    <Pencil/>
                    Edit
                  </Button>
              </DialogTrigger>
              <PreferencesEditor />
            </Dialog>
          }
        </div>

        <div className="px-8 border p-4 rounded-(--radius) flex flex-wrap gap-2">
          {query.data.preferences.map(p => 
            <Badge key={p} className="p-3" variant='secondary'>
              {
                prefOptions.find(o => o.value === p)?.label ?? ''
              }
            </Badge>
          )}
        </div>
      </section>
    }

    {/*Bio*/}
    <section className="space-y-4 max-w-260 mx-auto">
      <div className="flex justify-between">
        <span className="text-lg">
          Personal Information
        </span>
        { ability.can('update', {kind: 'personalInformation', userId: Number(id)}) &&
          <Dialog>
            <DialogTrigger asChild>
                <Button>
                  <Pencil/>
                  Edit
                </Button>
            </DialogTrigger>
            <PersonalInfoEditor />
          </Dialog>
        }
      </div>
      <dl className="grid grid-cols-[140px_1fr] gap-x-4 gap-y-3 px-8 border p-4 rounded-(--radius)">
        <dt className="text-sm text-muted-foreground">Name</dt>
        <dd className="font-medium">{query.data.bio.name}</dd>

        <dt className="text-sm text-muted-foreground">AICTE Number</dt>
        <dd>{query.data?.bio.aicteNo ?? 'Nil'}</dd>

        <dt className="text-sm text-muted-foreground">Anna University Faculty Identification Number</dt>
        <dd>{query.data.bio.annaUnivNo ?? 'Nil'}</dd>

        <dt className="text-sm text-muted-foreground">Experience</dt>
        <dd>{query.data.bio.yearOfExperience} years</dd>

        <dt className="text-sm text-muted-foreground">Department</dt>
        <dd>{query.data.bio.department}</dd>
      </dl>
    </section>

    {/*College*/}
    <section className="space-y-4 max-w-260 mx-auto">
      <div className="flex justify-between">
        <span className="text-lg">
          College Information
        </span>
        { ability.can('update', {kind: 'workPlace', userId: Number(id)}) &&
          <Dialog>
            <DialogTrigger asChild>
                <Button>
                  <Pencil/>
                  Edit
                </Button>
            </DialogTrigger>
            <CollegeInfoEditor />
          </Dialog>
        }
      </div>
      <dl className="grid grid-cols-[140px_1fr] gap-x-4 gap-y-3 px-8 border p-4 rounded-(--radius)">
        <dt className="text-sm text-muted-foreground">Designation</dt>
        <dd>{query.data.workPlace.designation}</dd>

        <dt className="text-sm text-muted-foreground">College Name</dt>
        <dd>{query.data.workPlace.collegeName}</dd>

        <dt className="text-sm text-muted-foreground">College Place</dt>
        <dd>{query.data.workPlace.collegePlace}</dd>

        <dt className="text-sm text-muted-foreground">College Pincode</dt>
        <dd>{query.data.workPlace.collegePinCode}</dd>

        <dt className="text-sm text-muted-foreground">Id Card Image</dt>
        {/*ATTENTION*/}
        <img 
          src={`http://localhost:3000/id-card-image/${query.data.workPlace.idCardImageFileName}`}
          width={300}
        />
      </dl>
    </section>

    {/*Contact*/}
    <section className="space-y-4 max-w-260 mx-auto">
      <div className="flex justify-between">
        <span className="text-lg">
          Contact Information
        </span>
        { ability.can('update', {kind: 'contact', userId: Number(id)}) &&
        <Dialog>
          <DialogTrigger asChild>
              <Button>
                <Pencil/>
                Edit
              </Button>
          </DialogTrigger>
          <ContactInfoEditor />
        </Dialog>
        }
      </div>
      <dl className="grid grid-cols-[140px_1fr] gap-x-4 gap-y-3 px-8 border p-4 rounded-(--radius)">
        <dt className="text-sm text-muted-foreground">Email</dt>
        <dd className="font-medium">{query.data.contact.email}</dd>

        <dt className="text-sm text-muted-foreground">Phone</dt>
        <dd>{query.data.contact.phone}</dd>
      </dl>
    </section>

    {/*Theory Courses*/}
    <section className="space-y-4 max-w-260 mx-auto">
      <div className="flex justify-between">
        <span className="text-lg">
          Theory Courses Handled
        </span>
        { ability.can('update', {kind: 'coursesHandled', userId: Number(id)}) &&
        <Dialog>
          <DialogTrigger asChild>
              <Button>
                <Pencil/>
                Edit
              </Button>
          </DialogTrigger>
          <TheoryCoursesEditor />
        </Dialog>
        }
      </div>
      <div className="flex gap-2 flex-wrap px-8 border p-4 rounded-(--radius)">
        {query.data.theoryHandled.map(c => 
          <Badge key={c.courseCode} className="p-3" variant='secondary'>
            {`${c.courseCode} | ${c.courseTitle}`}
          </Badge>
        )}
      </div>
    </section>

    {/*Practical Courses*/}
    <section className="space-y-4 max-w-260 mx-auto">
      <div className="flex justify-between">
        <span className="text-lg">
          Practical Courses Handled
        </span>
        { ability.can('update', {kind: 'coursesHandled', userId: Number(id)}) &&
        <Dialog>
          <DialogTrigger asChild>
              <Button>
                <Pencil/>
                Edit
              </Button>
          </DialogTrigger>
          <PracticalCoursesEditor />
        </Dialog>
        }
      </div>
      <div className="flex gap-2 flex-wrap px-8 border p-4 rounded-(--radius)">
        {query.data.practicalHandled.map(c => 
          <Badge key={c.courseCode} className="p-3" variant='secondary'>
            {`${c.courseCode} | ${c.courseTitle}`}
          </Badge>
        )
        }
        
      </div>
    </section>
  </div>
}

function CollegeInfoEditor() {

  const {id} = useParams();

  const query = useQuery({
    queryFn: async() => {
      const res = await apiClient.get<TsUserDetailedDTO>(`/examiners/${id}`)
      return res.data;
    },
    queryKey: ['examiner', id]
  });

  const mut = useMutation({
    mutationFn: async (v: WorkPlaceDTO) => {
      const res = await apiClient.put<WorkPlaceDTO>(`/examiners/${id}/workplace`, v)
      return res.data;
    } 
  })

  const fs = useFormik({
    enableReinitialize: true,
    initialValues: {
      designation: query.data?.workPlace.designation ?? '',
      collegeName: query.data?.workPlace.collegeName ?? '',
      collegePlace: query.data?.workPlace.collegePlace ?? '',
      collegePinCode: query.data?.workPlace.collegePinCode ?? '',
      idCardImage: null
    },
    validationSchema: collegeValidator,
    onSubmit: async vo => {
      //TODO
      //messy register handler. imporve this
      const v = collegeValidator.cast(vo);


      if(! v.idCardImage) {
        return toast.error('Upload id card image.');
      }

      const formData = new FormData();
      formData.append('file', v.idCardImage);
      const res = await fetch('http://localhost:3000/id-card-image', {
        method: 'POST',
        body: formData
      })
      if(res.status !== 201) {
        return toast.error('Cannot upload image.');
      }
      const { fileName } = await res.json();

      const { idCardImage, ...fields} = v;
      const payload: WorkPlaceDTO = {...fields, idCardImageFileName: fileName as string}

      const mutPromise = mut.mutateAsync(payload);

      toast.promise(mutPromise, {
        loading: 'Updating.',
        success: 'Updated.',
        error: (e) => e.response?.data?.message ?? 'something went wrong',
      })

      mutPromise.then(() => queryClient.invalidateQueries({queryKey: ['examiner', id]}))
    },

  });

  return(
    <DialogContent className="gap-0">
      <DialogHeader>
        <DialogTitle>
         Edit College Information
        </DialogTitle>
        <DialogDescription>
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-3 p-3 max-h-[70vh] overflow-y-scroll relative no-scrollbar">
        <div className="space-y-2">
          <Label className="">Designation</Label>
          <Select
            value={fs.values.designation}
            onValueChange={v => fs.setFieldValue('designation', v)}
            onOpenChange={() => fs.setFieldTouched('designation', true)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="Assistant Professor">Assistant Professor</SelectItem>
              <SelectItem value="Associate Professor">Associate Professor</SelectItem>
              <SelectItem value="Professor">Professor</SelectItem>
            </SelectContent>
          </Select>
          <FormikErrorField name="designation" formikState={fs} />
        </div>

        <div className="space-y-2">
          <Label className="">College Name</Label>
          <Input
            id='collegeName'
            name='collegeName'
            type="text"
            value={fs.values.collegeName}
            onChange={e => fs.setFieldValue('collegeName', e.target.value)}
            onBlur={fs.handleBlur}
          />
          <FormikErrorField name="collegeName" formikState={fs} />
        </div>

        <div className="space-y-2">
          <Label className="">College Place</Label>
          <Input
          id='collegePlace'
          name='collegePlace'
            type="text"
            value={fs.values.collegePlace}
            onChange={e => fs.setFieldValue('collegePlace', e.target.value)}
            onBlur={fs.handleBlur}
          />
          <FormikErrorField name="collegePlace" formikState={fs} />
        </div>

        <div className="space-y-2">
          <Label className="">College Pincode</Label>
          <Input
            id='collegePinCode'
            name='collegePinCode'
            type="text"
            value={fs.values.collegePinCode}
            onChange={e => fs.setFieldValue('collegePinCode', e.target.value)}
            onBlur={fs.handleBlur}
          />
          <FormikErrorField name="collegePinCode" formikState={fs} />
        </div>

        <div className="space-y-2">
          <Label className="">College Id Card Image</Label>
          <Input
            name='idCardImage'
            type="file"
            accept="image/png, image/jpeg"
            //value={fs.values.idCardImage ?? undefined}
            onChange={(v) => fs.setFieldValue('idCardImage', v.currentTarget.files?.[0] ?? null)}
            onBlur={fs.handleBlur}
          />
          <FormikErrorField name='idCardImage' formikState={fs} />
        </div>
      </div>
      <DialogFooter>
        <Button onClick={() => fs.handleSubmit()}>
          Save
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}

function PersonalInfoEditor() {

  const { id } = useParams();

  const query = useQuery({
    queryFn: async() => {
      const res = await apiClient.get<TsUserDetailedDTO>(`/examiners/${id}`)
      return res.data;
    },
    queryKey: ['examiner', id]
  });

  const personalMut = useMutation({
    mutationFn: async (v: UpdatablePersonalInfoDTO)  => {
      const res = await apiClient.put<UpdatablePersonalInfoDTO>(`/examiners/${id}/personal`, v)
      return res.data;
    }
  }) 

  const fs = useFormik({
    enableReinitialize: true,
    initialValues: {
      aicteNo: query.data?.bio.aicteNo ?? '', 
      annaUnivNo: query.data?.bio.annaUnivNo ?? '',
      yearOfExperience: query.data?.bio.yearOfExperience ?? 0,
    },
    validationSchema: personalInfoValidator,
    onSubmit: (vo) => {
      //ATTENTION
      // cant get yup to tranform empty string to null. so doing it here
      const v = personalInfoValidator.cast(vo);

      const payload = personalInfoValidator.cast(v)

      const mutPromise = personalMut.mutateAsync(payload)
      toast.promise(mutPromise, {
        loading: 'Updating.',
        success: 'Updated.',
        error: (e) => e.response?.data?.message ?? 'something went wrong',
      })
      mutPromise.then(() => queryClient.invalidateQueries({queryKey: ['examiner', id]}));
    }
  });
  return(
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          Edit Personal Information
        </DialogTitle>
        <DialogDescription>
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-3 p-3 max-h-[70vh] overflow-y-scroll relative no-scrollbar">
        <div className="space-y-2">
          <Label className="">AICTE Number</Label>
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

        <div className="space-y-2">
          <Label htmlFor="aicteNo">Anna University Faculty Identification Number (Optional)</Label>
          <Input
            name="annaUnivNo"
            value={fs.values.annaUnivNo}
            onChange={(v) => fs.setFieldValue('annaUnivNo', v.target.value)}
            onBlur={fs.handleBlur}
          />
          <FormikErrorField name='annaUnivNo' formikState={fs} />
        </div>

        <div className="space-y-2 flex flex-col gap-2">
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
      </div>
      <DialogFooter>
        <Button onClick={() => fs.handleSubmit()}>
        Save
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}

function ContactInfoEditor() {

  const { id } = useParams();

  const query = useQuery({
    queryFn: async() => {
      const res = await apiClient.get<TsUserDetailedDTO>(`/examiners/${id}`)
      return res.data;
    },
    queryKey: ['examiner', id]
  });

  const otpMut = useMutation({
    mutationFn: async (v: {email: string})  => {
      const res = await apiClient.post<void>('/verification/email', v)
      return res.data;
    }
  }) 

  const contactMut= useMutation({
    mutationFn: async (v: ContactDTO)  => {
      const res = await apiClient.put<ContactDTO>(`/examiners/${id}/contact`, v)
      return res.data;
    }
  }) 

  const fs = useFormik({
    enableReinitialize: true,
    initialValues: {
      email: query.data?.contact.email ?? '',
      phone: query.data?.contact.phone ?? '',
      otp: ''
    },
    validationSchema: contactValidator,
    onSubmit: (vo) => {
      const v = contactValidator.cast(vo);
      const mutPromise = contactMut.mutateAsync(v)
      toast.promise(mutPromise, {
        loading: 'Updating.',
        success: 'Contact Updated.',
        error: (e) => e.response?.data?.message ?? 'something went wrong',
      })
      mutPromise.then(() => queryClient.invalidateQueries({queryKey: ['examiner', id]}));
    }
  });
  return(
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          Edit Contact Information
        </DialogTitle>
        <DialogDescription>
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-3 p-3 max-h-[70vh] overflow-y-scroll relative no-scrollbar">
        <div className="space-y-2">
          <Label className="">Email</Label>
          <Input
            type="email"
            name="email"
            value={fs.values.email}
            onChange={(v) => fs.setFieldValue('email', v.target.value)}
            onBlur={fs.handleBlur}
          />
          <FormikErrorField name='email' formikState={fs} />
        </div>

        <div className="space-y-2">
          <Label className="">Phone</Label>
          <Input
            type="text"
            name="phone"
            value={fs.values.phone}
            onChange={v => fs.setFieldValue('phone', v.target.value)}
            onBlur={fs.handleBlur}
          />
          <FormikErrorField name='phone' formikState={fs} />
        </div>

        <div className="space-y-2 flex flex-col gap-2">
          <Button onClick={() => {
            const mutPromise = otpMut.mutateAsync({email: fs.values.email})
            toast.promise(mutPromise, {
              loading: 'Sending otp.',
              error: (e) => e.response?.data?.message ?? 'something went wrong',
              success: 'OTP Sent.'
            });
          }}>
            Verify email via OTP 
          </Button>
          <InputOTP
            name='otp'
            maxLength={6}
            value={fs.values.otp}
            onChange={v => fs.setFieldValue('otp', v)}
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
      <DialogFooter>
        <Button onClick={() => fs.handleSubmit()}>
        Save
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}

function TheoryCoursesEditor() {

  const [selection, setSelection] = useState<string[]>([]);

  const { id } = useParams();

  const {data: prevTheoryData} = useQuery({
    queryFn: async() => {
      const res = await apiClient.get<TsUserDetailedDTO>(`/examiners/${id}`)
      return res.data;
    },
    queryKey: ['examiner', id]
  });


  const theoryCoursesQuery = useQuery({
    queryFn: async() => {
      const res = await apiClient.get<CourseDTO[]>('/courses/theory')
      return res.data;
    },
    queryKey: ['theoryCourses']
  }); 

  const theoryCoursesMut = useMutation({
    mutationFn: async(v: CourseDTO[]) => {
      const res = await apiClient.put<CourseDTO[]>(`/examiners/${id}/theoryHandled`, v)
      return res.data;
    }
  }); 

  useEffect(() => {
    if(! prevTheoryData) {
      return
    }

    const preSelCourses = prevTheoryData.theoryHandled.
      map(c => c.courseCode)

    setSelection(preSelCourses);

  }, [prevTheoryData])

  if(theoryCoursesQuery.isLoading) {
    return <h1>Loading...</h1>
  }
  if(theoryCoursesQuery.data === undefined) {
    return <h1>Something went wrong.</h1>
  }

  const courseValuesForMulti = theoryCoursesQuery.data.map(c => ({
    value: c.courseCode,
    label: `${c.courseCode} | ${c.courseTitle}` 
  }));

  const handleSubmit = () => {
    const selectedCourses = theoryCoursesQuery.data.filter(c => selection.includes(c.courseCode))
    const mutPromise = theoryCoursesMut.mutateAsync(selectedCourses);
    toast.promise(mutPromise, {
      loading: 'Updating.',
      success: 'Updated.',
      error: (e) => e.response?.data?.message ?? 'something went wrong',
    })
    mutPromise.then(() => queryClient.invalidateQueries({queryKey: ['examiner', id]}));
  }

  return <DialogContent className="sm:max-w-[80vw]">
    <DialogHeader>
      <DialogTitle>
        Choose Theory Courses
      </DialogTitle>
    </DialogHeader>
    <div className="space-y-3 p-3 max-h-[70vh] overflow-y-scroll relative no-scrollbar">
      <MultiSelect
        className="border-border"
        maxCount={6}
        options={courseValuesForMulti}
        onValueChange={setSelection}
        defaultValue={selection}
      />
    </div>
    <DialogFooter>
      <Button onClick={() => handleSubmit()}>
        Save
      </Button>
    </DialogFooter>
  </DialogContent>
}

function PracticalCoursesEditor() {

  const [selection, setSelection] = useState<string[]>([]);

  const { id } = useParams();

  const {data: prevTheoryData} = useQuery({
    queryFn: async() => {
      const res = await apiClient.get<TsUserDetailedDTO>(`/examiners/${id}`)
      return res.data;
    },
    queryKey: ['examiner', id]
  });

  const practicalCoursesQuery = useQuery({
    queryFn: async() => {
      const res = await apiClient.get<CourseDTO[]>('/courses/practical')
      return res.data;
    },
    queryKey: ['practical']
  }); 

  const practicalCoursesMut = useMutation({
    mutationFn: async(v: CourseDTO[]) => {
      const res = await apiClient.put<CourseDTO[]>(`/examiners/${id}/practicalHandled`, v)
      return res.data;
    }
  }); 

  useEffect(() => {
    if(! prevTheoryData) {
      return
    }

    const preSelCourses = prevTheoryData.practicalHandled.
      map(c => c.courseCode)

    setSelection(preSelCourses);

  }, [prevTheoryData])

  if(practicalCoursesQuery.isLoading) {
    return <h1>Loading...</h1>
  }
  if(practicalCoursesQuery.data === undefined) {
    return <h1>Something went wrong.</h1>
  }

  const courseValuesForMulti = practicalCoursesQuery.data.map(c => ({
    value: c.courseCode,
    label: `${c.courseCode} | ${c.courseTitle}` 
  }));

  const handleSubmit = () => {
    const selectedCourses = practicalCoursesQuery.data.filter(c => selection.includes(c.courseCode))
    const mutPromise = practicalCoursesMut.mutateAsync(selectedCourses);
    toast.promise(mutPromise, {
      loading: 'Updating.',
      success: 'Updated.',
      error: (e) => e.response?.data?.message ?? 'something went wrong',
    })
    mutPromise.then(() => queryClient.invalidateQueries({queryKey: ['examiner', id]}));
  }

  return <DialogContent className="sm:max-w-[80vw]">
    <DialogHeader>
      <DialogTitle>
        Choose Practical Courses
      </DialogTitle>
    </DialogHeader>
    <div className="space-y-3 p-3 max-h-[70vh] overflow-y-scroll relative no-scrollbar">
      <MultiSelect
        className="border-border"
        maxCount={6}
        options={courseValuesForMulti}
        defaultValue={selection}
        onValueChange={setSelection}
      />
    </div>
    <DialogFooter>
      <Button onClick={() => handleSubmit()}>
        Save
      </Button>
    </DialogFooter>
  </DialogContent>
}

function PreferencesEditor() {

  const [selection, setSelection] = useState<string[]>([]);

  const { id } = useParams();

  const {data: prevPrefData} = useQuery({
    queryFn: async() => {
      const res = await apiClient.get<TsUserDetailedDTO>(`/examiners/${id}`)
      return res.data;
    },
    queryKey: ['examiner', id]
  });


  const prefMut = useMutation({
    mutationFn: async (v: {preferences: string[]}) => {
      const res = await apiClient.put<{preferences: string[]}>(`/examiners/${id}/preferences`, v)
      return res.data;
    } 
  })

  useEffect(() => {
    if(! prevPrefData) {
      return
    }

    const preSelPref = prevPrefData.preferences

    if(! preSelPref) {
      return;
    }

    setSelection(preSelPref);

  }, [prevPrefData])

  if(! prevPrefData) {
    return <div>Something went wrong</div>
  }

  const handleSubmit = () => {
    const mutPromise = prefMut.mutateAsync({preferences: selection});
    toast.promise(mutPromise, {
      loading: 'Updating.',
      success: 'Updated.',
      error: (e) => e.response?.data?.message ?? 'something went wrong',
    })
    mutPromise.then(() => queryClient.invalidateQueries({queryKey: ['examiner', id]}));
  }

  return <DialogContent className="sm:max-w-[50vw]">
    <DialogHeader>
      <DialogTitle>
        Choose Preferences
      </DialogTitle>
    </DialogHeader>
    <div className="space-y-3 p-3 max-h-[70vh] overflow-y-scroll relative no-scrollbar">
      <MultiSelect
        className="border-border"
        maxCount={6}
        options={prefOptions}
        defaultValue={selection}
        onValueChange={setSelection}
      />
    </div>
    <DialogFooter>
      <Button onClick={() => handleSubmit()}>
        Save
      </Button>
    </DialogFooter>
  </DialogContent>
}
