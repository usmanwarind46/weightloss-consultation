import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format, parse } from "date-fns";
import NextButton from "@/Components/NextButton/NextButton";
import Dose from "@/Components/Dose/Dose";
import AddOn from "@/Components/AddOn/AddOn";
import { useRouter } from "next/router";
import useVariationStore from "@/store/useVariationStore";
import useCartStore from "@/store/useCartStore";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import useReorder from "@/store/useReorderStore";
import { abandonCart } from "@/api/mergeRoutes";
import { useMutation } from "@tanstack/react-query";
import useProductId from "@/store/useProductIdStore";
import BackButton from "@/Components/BackButton/BackButton";
import StepsHeader from "@/layout/stepsHeader";
import { MdDelete } from "react-icons/md";
import ConfirmationModal from "@/Components/Modal/ConfirmationModal";
import { Checkbox, FormControlLabel, ThemeProvider } from "@mui/material";
import MetaLayout from "@/Meta/MetaLayout";
import {
  FoundayoProductId,
  meta_url,
  WegovyPillProductId,
} from "@/config/constants";
import useNeedleConsent from "@/store/needleConsent";
import { FaShoppingCart } from "react-icons/fa";
import useAbandonCardStore from "@/store/abandonCardStore";
import brandTheme from "@/config/muiTheme";

export default function DosageSelection() {
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [abandonData, setAbandonData] = useState([]);
  const [prevMedication, setPrevMedication] = useState("");
  const [prevDose, setPrevDose] = useState("");
  const [lastTakenDate, setLastTakenDate] = useState("");
  const router = useRouter();
  const { addToCart, increaseQuantity, decreaseQuantity, items, totalAmount, setConsentGiven } =
    useCartStore();
  const { productId } = useProductId();
  const [showModal, setShowModal] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null); // { id, type }
  const [showModalManjaro, setShowModalForManjaro] = useState(false);

  const { reorder } = useReorder();
  const {
    register,
    handleSubmit,
    clearErrors,
    setValue,
    formState: { isValid, errors },
  } = useForm({
    mode: "onChange",
  });
  const [isExpiryRequired, setIsExpiryRequired] = useState(false);
  const { abandonCard, extra } = useAbandonCardStore();
  // Variation From zustand
  const { variation } = useVariationStore();
  const { removeItemCompletely } = useCartStore();
  const { setNeedleMessage, needleMessage } = useNeedleConsent();

  // ✅ useEffect to check if `product?.show_expiry` is `0` or `1`
  useEffect(() => {
    if (variation?.show_expiry === 1) {
      setIsExpiryRequired(true);
    } else {
      setIsExpiryRequired(false);
      clearErrors("terms");
      setValue("terms", false);
    }
  }, [variation?.show_expiry, clearErrors, setValue]);

  useEffect(() => {
    items.doses.forEach((dose) => {
      if (dose.product_concent && !dose.consentGiven) {
        removeItemCompletely(dose.id, "dose");
      }
    });
  }, []);

  const allowed = variation?.allowed;
  const [showDoseModal, setShowDoseModal] = useState(false);
  const [selectedDose, setSelectedDose] = useState(null);

  const abandonCartMutation = useMutation(abandonCart, {
    onSuccess: (data) => {
      if (data) {
        // router.push("/checkout");
        console.log(data, "This is Abandon Cart Data");
      }
    },
    onError: (error) => {
      if (error) {
        // router.push("/checkout");
        console.log(error, "This is error");
      }
    },
  });

  //Handle Submit Button
  // const onSubmit = () => {
  //   setIsButtonLoading(true);
  //   if (
  //     productId == 4 &&
  //     items?.addons?.find((addon) => addon.name === "Box of 5 Needles")
  //   ) {
  //     abandonCartMutation.mutate(abandonData);
  //   } else if (productId == 1) {
  //     abandonCartMutation.mutate(abandonData);
  //   } else {
  //     setShowModalForManjaro(true);
  //   }

  //   router.push("/checkout");
  // };

  const onSubmit = () => {
    setIsButtonLoading(true);

    const hasNeedles = items?.addons?.find(
      (addon) => addon.name === "Box of 5 Needles",
    );

    // Product ID 4 = Mounjaro
    // If no needles selected, show popup and stop checkout
    if (productId == 4 && !hasNeedles) {
      setShowModalForManjaro(true);
      setIsButtonLoading(false);
      return;
    }

    //⚠️ commit krdia h yaha sy q k ab har dose k click k api direct chaly gi⚠️
    // if (productId == 4 && hasNeedles) {
    //   abandonCartMutation.mutate(abandonData);
    // } else if (productId == 1) {
    //   abandonCartMutation.mutate(abandonData);
    // }

    router.push("/checkout");
  };

  //Allowed checking here 🔥
  const totalSelectedQty = () =>
    items?.doses.reduce((total, v) => total + v.qty, 0);

  // ✅ Put here → outside your component or at the top inside your component file
  const generateProductConcent = (variations, selectedDoseName) => {
    if (productId == WegovyPillProductId) {
      return `If this is your first time taking Wegovy Tablets, you should start with the 1.5mg dose. Starting on a higher dose may increase the risk of side effects.\n\nPlease confirm that you are currently taking Wegovy Tablets from another provider, or have previously used, or currently use, a GLP-1 treatment such as Wegovy or Mounjaro.`;
    }

    if (productId == FoundayoProductId) {
      return `If this is your first time taking Foundayo Tablets or a GLP-1 medication, you should start with the 0.8mg dose. Starting on a higher dose may increase the risk of side effects.\n\nPlease confirm that you are currently taking Foundayo Tablets from another provider, or have previously used, or currently use, a GLP-1 treatment such as Wegovy or Mounjaro.`;
    }

    const sortedVariations = [...variations].sort((a, b) => {
      console.log(a, b, "sfkjefjfsj");
      const aMg = parseFloat(a.name);
      const bMg = parseFloat(b.name);
      return aMg - bMg;
    });

    const lowestDose = sortedVariations[0]?.name;

    const selectedIndex = sortedVariations.findIndex(
      (v) => v.name === selectedDoseName,
    );

    const previousDose =
      selectedIndex > 0 ? sortedVariations[selectedIndex - 1]?.name : null;

    return `If you are taking for the first time, you will need to start the treatment on the ${lowestDose} dose. If you start on the higher doses, the risk of side effects (e.g., nausea) will be very high. Please confirm that you are currently taking either the ${previousDose} or ${selectedDoseName} dose from a different provider.`;
  };

  const handleAddDose = (dose) => {
    const totalQty = totalSelectedQty() + 1;

    if (allowed > 0 && totalQty > allowed) {
      toast.error(`You can select only ${allowed} units in total.`);
      return;
    }

    const stockQuantity = parseInt(dose?.stock?.quantity) || 0;
    const existingItem = items?.doses?.find((i) => i.id === dose.id);
    const currentQty = existingItem?.quantity || 0;

    if (currentQty + 1 > stockQuantity) {
      toast.error(`Only ${stockQuantity} units available in stock.`);
      return;
    }

    const isFiveMg = dose?.name === "5 mg";
    const firstTwoDoses = variation?.variations?.slice(0, 1).map((v) => v.name);
    const isFirstTwoDose = firstTwoDoses?.includes(dose?.name);

    if ((isFirstTwoDose && !isFiveMg) || reorder == true) {
      addToCart({
        id: dose.id,
        type: "dose",
        name: dose.name,
        price: parseFloat(dose.price),
        allowed: parseInt(dose.allowed),
        item_id: dose.id,
        product: dose?.product_name || "Dose Product",
        product_concent: null,
        label: `${dose?.product_name} ${dose?.name}`,
        expiry: dose.expiry,
        isSelected: true,
      });
      // setAbandonData([
      //   ...abandonData,
      //   {
      //     eid: dose.id,
      //     pid: productId,
      //   },
      // ]);

      abandonCartMutation.mutate({
        eid: dose.id,
        pid: productId || abandonCard?.productId,
      });
    } else {
      const productConcent = generateProductConcent(
        variation?.variations,
        dose?.name,
      );

      addToCart({
        id: dose.id,
        type: "dose",
        name: dose.name,
        price: parseFloat(dose.price),
        allowed: parseInt(dose.allowed),
        item_id: dose.id,
        product: dose?.product_name || "Dose Product",
        product_concent: productConcent,
        label: `${dose?.product_name} ${dose?.name}`,
        expiry: dose.expiry,
        isSelected: true,
      });

      // setAbandonData([
      //   ...abandonData,
      //   {
      //     eid: dose.id,
      //     pid: productId,
      //   },
      // ]);
      abandonCartMutation.mutate({
        eid: dose.id,
        pid: productId || abandonCard?.productId,
      });
      setSelectedDose({
        ...dose,
        productConcent: productConcent,
      });
      setShowDoseModal(true);
    }
  };

  //Add to cart Addons🔥

  const handleAddAddonNeddles = (addon) => {
    addToCart({
      id: addon.id,
      type: "addon",
      name: addon.name,
      price: parseFloat(addon.price),
      allowed: parseInt(addon.allowed),
      item_id: addon.id,
      product: addon?.title || "Addon Product",
      product_concent: null,
      label: addon?.name,
      expiry: addon.expiry,
      isSelected: true,
    });
  };

  const handleAddAddon = (addon) => {
    addToCart({
      id: addon.id,
      type: "addon",
      name: addon.name,
      price: parseFloat(addon.price),
      allowed: parseInt(addon.allowed),
      item_id: addon.id,
      product: addon?.title || "Addon Product",
      product_concent: null,
      label: addon?.name,
      expiry: addon.expiry,
      isSelected: true,
    });
  };

  // 🔥⚠️⚠️⚠️⚠️⚠️Abandone card selected dose auto add krne k liye useEffect ⚠️⚠️⚠️⚠️⚠️
  useEffect(() => {
    if (!abandonCard || !extra) return;
    if (!variation?.variations) return;

    if (abandonCard?.type === "abandoned-cart") {
      handleAddDose(extra);
    }
  }, [abandonCard, extra]);

  const Back = () => {
    router.push("/confirmation-summary");
  };

  const handleConfirmForManjaro = () => {
    setNeedleMessage("I confirm that I do not require needles");
    abandonCartMutation.mutate(abandonData);
    router.push("/checkout");
    setShowModalForManjaro(false);
  };

  // console.log(variation?.addons?.name == "Box of 5 Needles", variation?.addons")
  return (
    <>
      <AnimatePresence>
        {showModalManjaro && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[9999] px-3 sm:px-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_20px_60px_rgba(30,20,60,0.18)]"
            >
              <h2 className="inter-semibold-font mb-4 text-center text-[19px] text-slate-900">
                Needles are not included with Mounjaro
              </h2>

              <p className="inter-reg-font mb-5 text-center text-[13.5px] leading-6 text-slate-600">
                Please note that Mounjaro is supplied without needles. If you
                require needles, please add them to your order. If you already
                have suitable needles, please confirm below to proceed.{" "}
              </p>

              <NextButton
                label="Add needles to the order"
                className=""
                icon={<FaShoppingCart size={16} />}
                onClick={() => {
                  setShowModalForManjaro(false);
                  setIsButtonLoading(false);
                  handleAddAddonNeddles(
                    variation?.addons?.find(
                      (addon) => addon.name === "Box of 5 Needles",
                    ),
                  );
                }}
              />

              <button
                noCapitalize={true}
                onClick={() => {
                  handleConfirmForManjaro(false);
                }}
                className="inter-medium-font mt-2 w-full cursor-pointer rounded-xl border border-slate-200 px-4 py-3 text-[14px] text-[#4565BF] transition-colors hover:bg-slate-50"
              >
                I confirm that I do not require needles
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <MetaLayout canonical={`${meta_url}dosage-selection/`} />
      <StepsHeader />

      <AnimatePresence>
        {showDoseModal && selectedDose && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[9999] px-3 sm:px-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="max-h-[calc(100dvh-48px)] w-full max-w-md overflow-y-auto rounded-[22px] border border-white/80 bg-white shadow-[0_28px_80px_rgba(30,20,60,0.22)]"
            >
              <div className="relative border-b border-slate-100 bg-white px-6 py-5 pr-16">
                <h2 className="inter-semibold-font text-[19px] tracking-[-0.01em] text-slate-900">
                  Dosage Confirmation
                </h2>
                <button
                  type="button"
                  aria-label="Close dosage confirmation"
                  onClick={() => {
                    removeItemCompletely(selectedDose?.id, "dose");
                    setPrevMedication("");
                    setPrevDose("");
                    setLastTakenDate("");
                    setShowDoseModal(false);
                  }}
                  className="absolute right-4 top-1/2 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 transition-all duration-150 hover:border-[#4565BF]/20 hover:bg-[#4565BF]/[0.05] hover:text-[#4565BF] active:scale-95"
                >
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M1.5 1.5L12.5 12.5M12.5 1.5L1.5 12.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
              <div className="px-6 py-5">
                {selectedDose?.productConcent && (
                  <p className="inter-reg-font text-[13.5px] leading-[1.65] text-slate-600">
                    {selectedDose?.productConcent}
                  </p>
                )}
                <div className="mt-5 space-y-4">
                  <div>
                    <label className="inter-medium-font mb-1 block text-[13px] text-slate-700">
                      Previous medication name
                    </label>
                    <input
                      type="text"
                      value={prevMedication}
                      onChange={(e) => setPrevMedication(e.target.value)}
                      placeholder="e.g. Ozempic, Mounjaro, Wegovy"
                      className="inter-reg-font h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-[14px] text-slate-800 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-[#4565BF] focus:bg-white focus:ring-4 focus:ring-[#4565BF]/[0.08]"
                    />
                  </div>
                  <div>
                    <label className="inter-medium-font mb-1 block text-[13px] text-slate-700">
                      What dose were you on? (mg)
                    </label>
                    <input
                      type="text"
                      value={prevDose}
                      onChange={(e) => setPrevDose(e.target.value)}
                      placeholder="e.g. 2.5"
                      className="inter-reg-font h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-[14px] text-slate-800 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-[#4565BF] focus:bg-white focus:ring-4 focus:ring-[#4565BF]/[0.08]"
                    />
                  </div>
                  <div>
                    <label className="inter-medium-font mb-1 block text-[13px] text-slate-700">
                      When did you last take it?
                    </label>
                    <ThemeProvider theme={brandTheme}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        value={
                          lastTakenDate
                            ? parse(lastTakenDate, "yyyy-MM-dd", new Date())
                            : null
                        }
                        onChange={(date) =>
                          setLastTakenDate(date ? format(date, "yyyy-MM-dd") : "")
                        }
                        maxDate={new Date()}
                        format="dd/MM/yyyy"
                        className="inter-reg-font"
                        slotProps={{
                          popper: {
                            sx: { zIndex: 10000 },
                          },
                          dialog: {
                            sx: { zIndex: 10000 },
                          },
                          desktopPaper: {
                            sx: {
                              borderRadius: "16px",
                              "& .MuiPickersDay-root.Mui-selected": {
                                backgroundColor: "#4565BF",
                                "&:hover, &:focus": { backgroundColor: "#3550a0" },
                              },
                            },
                          },
                          mobilePaper: {
                            sx: {
                              borderRadius: "16px",
                              "& .MuiPickersDay-root.Mui-selected": {
                                backgroundColor: "#4565BF",
                                "&:hover, &:focus": { backgroundColor: "#3550a0" },
                              },
                            },
                          },
                          textField: {
                            fullWidth: true,
                            placeholder: "DD/MM/YYYY",
                            sx: {
                              "& .MuiOutlinedInput-root, & .MuiPickersOutlinedInput-root": {
                                borderRadius: "12px",
                                backgroundColor: "rgba(248,250,252,0.5)",
                                fontFamily: "var(--inter-reg)",
                                fontSize: "14px",
                                transition: "box-shadow 180ms ease",
                                "&.Mui-focused": {
                                  backgroundColor: "#ffffff",
                                  boxShadow: "0 0 0 3px rgba(69, 101, 191, 0.10)",
                                },
                              },
                              "& .MuiOutlinedInput-notchedOutline, & .MuiPickersOutlinedInput-notchedOutline": {
                                borderColor: "#e2e8f0",
                                borderWidth: "2px",
                                borderRadius: "0.75rem",
                                transition: "border-color 180ms ease",
                              },
                              "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline, & .MuiPickersOutlinedInput-root:hover .MuiPickersOutlinedInput-notchedOutline": {
                                borderColor: "#4565BF !important",
                              },
                              "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline, & .MuiPickersOutlinedInput-root.Mui-focused .MuiPickersOutlinedInput-notchedOutline": {
                                borderColor: "#4565BF !important",
                                borderWidth: "2px",
                              },
                              "& .MuiIconButton-root": {
                                color: "#4565BF !important",
                              },
                            },
                          },
                        }}
                      />
                    </LocalizationProvider>
                    </ThemeProvider>
                  </div>
                </div>
              </div>
              <div className="px-6 pb-6">
                <NextButton
                  label={
                    productId == FoundayoProductId ||
                    productId == WegovyPillProductId
                      ? "I confirm this dose"
                      : " I Confirm"
                  }
                  disabled={!prevMedication || !prevDose || !lastTakenDate}
                  className="w-full"
                  onClick={() => {
                    console.log({
                      medication_name: prevMedication,
                      dosage: prevDose,
                      dosage_time: lastTakenDate,
                      selectedDose: selectedDose?.name,
                    });
                    setConsentGiven(selectedDose?.id, {
                      medication_name: prevMedication,
                      dosage: prevDose,
                      dosage_time: lastTakenDate,
                    });
                    setPrevMedication("");
                    setPrevDose("");
                    setLastTakenDate("");
                    setShowDoseModal(false);
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full bg-[#EEF2FA] rounded-xl px-4 sm:px-8">
        <div className="w-full max-w-screen-xl mx-auto rounded-md">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-12 gap-4 w-full max-w-3xl mx-auto">
              {/* === LEFT COLUMN === */}
              <div className="col-span-12 sm:col-span-8 px-4 md:px-4 py-10">
                <div className="w-full max-w-screen-md mx-auto">
                  <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white mb-6">
                    <div className="flex items-center justify-center bg-[#4565BF] p-4 sm:p-6">
                      <img
                        src={variation?.img}
                        alt={variation?.name}
                        className="w-full h-36 object-contain"
                      />
                    </div>
                    <div className="p-4 sm:p-6">
                      <h2 className="inter-semibold-font text-xl sm:text-2xl mb-1.5 text-slate-900">
                        {variation?.name}
                      </h2>
                      <span className="inter-medium-font text-[#4565BF] text-sm sm:text-base">
                        From £{variation?.price}
                      </span>

                      {variation?.variations?.[0]?.product_name ===
                        "Mounjaro (Tirzepatide)" && (
                        <p className="inter-reg-font mt-3 text-[13px] leading-relaxed text-slate-500">
                          Needles are not included with{" "}
                          <span className="inter-semibold-font text-slate-700">
                            Mounjaro
                          </span>
                          . Add them to your order if required.
                        </p>
                      )}
                    </div>
                  </div>

                  <h1 className="inter-semibold-font mb-4 text-[16px] sm:text-[18px] text-slate-900 text-start">
                    Choose your dosage
                  </h1>

                  {variation?.variations
                    ?.sort((a, b) => {
                      const aOutOfStock = a?.stock?.status === 0;
                      const bOutOfStock = b?.stock?.status === 0;
                      const qOutOfStock = b?.stock?.quantity === 0;
                      const qaOutOfStock = a?.stock?.quantity === 0;

                      if (qaOutOfStock && !qOutOfStock) return 1;
                      if (!qaOutOfStock && qOutOfStock) return -1;
                      if (aOutOfStock && !bOutOfStock) return 1;
                      if (!aOutOfStock && bOutOfStock) return -1;
                      return 0;
                    })
                    .map((dose, index) => {
                      const cartDose = items.doses.find(
                        (item) => item.id === dose.id,
                      );
                      const cartQty = cartDose?.qty || 0;

                      const is72mgWegovy =
                        dose?.name === "7.2mg" && productId == 1;
                      const is72mgSelected = is72mgWegovy && cartQty > 0;

                      return (
                        <React.Fragment key={index}>
                          <Dose
                            doseData={dose}
                            allow={allowed}
                            qty={cartQty}
                            totalSelectedQty={totalSelectedQty}
                            isSelected={cartQty > 0}
                            onAdd={() => handleAddDose(dose)}
                            onIncrement={() =>
                              increaseQuantity(dose.id, "dose")
                            }
                            onDecrement={() =>
                              decreaseQuantity(dose.id, "dose")
                            }
                          />

                          <AnimatePresence>
                            {is72mgSelected && (
                              <motion.div
                                initial={{ opacity: 0, y: -8, height: 0 }}
                                animate={{ opacity: 1, y: 0, height: "auto" }}
                                exit={{ opacity: 0, y: -8, height: 0 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                                className="overflow-hidden"
                              >
                                <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3.5 mt-1 mb-1">
                                  <span className="text-amber-500 mt-0.5 text-lg leading-none">
                                    ℹ️
                                  </span>
                                  <p className="inter-reg-font text-amber-800 text-sm leading-relaxed">
                                    <span className="inter-semibold-font">
                                      Please note:
                                    </span>{" "}
                                    The 7.2mg pack is supplied as four
                                    single-dose pens. Other strengths are
                                    supplied as a single FlexTouch pen
                                    containing four doses.
                                  </p>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </React.Fragment>
                      );
                    })}

                  {variation?.show_expiry === 1 && (
                    <div className="mt-4 rounded-xl border border-slate-100 bg-white p-4">
                      <FormControlLabel
                        control={
                          <Checkbox
                            {...register("terms", {
                              required: isExpiryRequired
                                ? "Please confirm that you have read and acknowledged the expiry information."
                                : false,
                            })}
                            icon={
                              <span className="w-5 h-5 border-2 border-slate-300 rounded-full flex items-center justify-center" />
                            }
                            checkedIcon={
                              <span className="w-5 h-5 border-2 border-[#4565BF] rounded-full flex items-center justify-center">
                                <span className="w-2.5 h-2.5 bg-[#4565BF] rounded-full" />
                              </span>
                            }
                            sx={{
                              "& .MuiSvgIcon-root": {
                                display: "none",
                              },
                            }}
                          />
                        }
                        label={
                          <p className="inter-medium-font text-[14px] leading-relaxed text-slate-700">
                            Please confirm that you have reviewed the expiry
                            dates of the selected doses.
                          </p>
                        }
                      />
                      {errors.terms && (
                        <p className="inter-reg-font mt-1.5 text-[12px] text-red-500">
                          {errors.terms.message}
                        </p>
                      )}
                    </div>
                  )}

                  {Array.isArray(variation?.addons) &&
                    variation?.addons.length > 0 &&
                    productId != FoundayoProductId &&
                    productId != WegovyPillProductId && (
                      <div className="mt-6">
                        <h1 className="inter-semibold-font mb-4 text-[16px] sm:text-[18px] text-slate-900">
                          Select add-ons
                        </h1>

                        {variation?.addons
                          .sort((a, b) => {
                            const aOutOfStock =
                              a?.stock?.status === 0 || a?.stock?.quantity === 0
                                ? 1
                                : 0;
                            const bOutOfStock =
                              b?.stock?.status === 0 || b?.stock?.quantity === 0
                                ? 1
                                : 0;
                            return aOutOfStock - bOutOfStock;
                          })
                          .map((addon) => {
                            const cartAddon = items.addons.find(
                              (item) => item.id === addon.id,
                            );
                            const cartQty = cartAddon?.qty || 0;

                            return (
                              <AddOn
                                key={addon.id}
                                addon={addon}
                                quantity={cartQty}
                                isSelected={cartQty > 0}
                                onAdd={() => handleAddAddon(addon)}
                                onIncrement={() =>
                                  increaseQuantity(addon.id, "addon")
                                }
                                onDecrement={() =>
                                  decreaseQuantity(addon.id, "addon")
                                }
                              />
                            );
                          })}
                      </div>
                    )}
                  <div className="justify-between items-center mt-6 sm:flex hidden">
                    <BackButton
                      label="Back"
                      onClick={Back}
                      type="button"
                      className="w-full sm:w-auto"
                    />
                    <NextButton
                      onClick={handleSubmit(onSubmit)}
                      disabled={totalSelectedQty() === 0 || !isValid}
                      label="Proceed to Checkout"
                      className="w-full sm:w-auto"
                      loading={isButtonLoading}
                    />
                  </div>
                </div>
              </div>

              {/* === RIGHT COLUMN === */}
              <div className="col-span-12 sm:col-span-4">
                <div className="w-full sm:fixed mt-6 sm:mt-10">
                  <div className="w-full overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 sm:max-w-[400px]">
                    <h2 className="inter-semibold-font mb-4 p-4 text-[16px] text-slate-900">
                      Order Summary
                    </h2>
                    <div className="overflow-y-auto max-h-[300px] space-y-3 scrollbar-thin scrollbar-thumb-gray-300 px-1">
                      {/* === DOSES === */}
                      {items?.doses?.length > 0 ? (
                        items.doses.map((item) => (
                          <React.Fragment key={item.id}>
                            <div className="flex justify-between items-start rounded-xl border border-slate-100 bg-[#4565BF]/[0.03] px-4 py-3">
                              <div className="inter-reg-font flex flex-col text-sm text-slate-800 max-w-[80%]">
                                <span className="line-clamp-2 leading-5">
                                  {item.product} {item.name}, {item.qty}x
                                </span>
                                <span className="inter-semibold-font text-slate-900 mt-1">
                                  £
                                  {(item.qty * parseFloat(item.price)).toFixed(
                                    2,
                                  )}
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  const type = items.doses.find(
                                    (i) => i.id === item.id,
                                  )
                                    ? "dose"
                                    : "addon";
                                  setItemToRemove({ id: item.id, type });
                                  setShowModal(true);
                                }}
                                className="cursor-pointer bg-red-100 hover:bg-red-200 text-red-500 rounded-full p-2 transition"
                              >
                                <MdDelete size={18} />
                              </button>
                            </div>

                            {/* Show Pack of 5 Needle ONLY for "Mounjaro (Tirzepatide)" */}
                            {/* {item.product === "Mounjaro (Tirzepatide)" && (
                              <div className="flex justify-between items-center bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
                                <span className="text-gray-600 text-sm reg-font">
                                  Pack of 5 Needle, {item.qty}x
                                </span>
                                <span className="font-bold text-gray-800">£0.00</span>
                              </div>
                            )} */}
                          </React.Fragment>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm"></p>
                      )}

                      {/* === ADDONS === */}
                      {items?.addons?.length > 0 ? (
                        items.addons.map((item) => (
                          <div
                            key={item.id}
                            className="flex justify-between items-start rounded-xl border border-slate-100 bg-[#4565BF]/[0.03] px-4 py-3"
                          >
                            <div className="inter-reg-font flex flex-col text-sm text-slate-800 max-w-[80%]">
                              <span className="line-clamp-2 leading-5">
                                {item.product} {item.name}, {item.qty}x
                              </span>
                              <span className="inter-semibold-font text-slate-900 mt-1">
                                £
                                {(item.qty * parseFloat(item.price)).toFixed(2)}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                const type = items.addons.find(
                                  (i) => i.id === item.id,
                                )
                                  ? "addon"
                                  : "dose";
                                setItemToRemove({ id: item.id, type });
                                setShowModal(true);
                              }}
                              className="cursor-pointer bg-red-100 hover:bg-red-200 text-red-500 rounded-full p-2 transition"
                            >
                              <MdDelete size={18} />
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm"></p>
                      )}
                    </div>

                    {/* === TOTAL === */}
                    <div className="flex justify-between items-center border-t border-slate-100 pt-4 mt-4 px-1">
                      <span className="inter-semibold-font text-slate-900">
                        Total
                      </span>
                      <span className="inter-bold-font text-xl text-slate-900">
                        £{totalAmount?.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3 mt-6 sm:hidden block">
              <NextButton
                onClick={handleSubmit(onSubmit)}
                disabled={totalSelectedQty() === 0 || !isValid}
                label="Proceed to Checkout"
                loading={isButtonLoading}
              />
              <BackButton label="Back" onClick={Back} type="button" />
            </div>
          </form>
        </div>
      </div>
      <ConfirmationModal
        showModal={showModal}
        onConfirm={() => {
          if (itemToRemove) {
            removeItemCompletely(itemToRemove.id, itemToRemove.type);
          }
          setShowModal(false);
          setItemToRemove(null);
        }}
        onCancel={() => {
          setShowModal(false);
          setItemToRemove(null);
        }}
      />
    </>
  );
}
