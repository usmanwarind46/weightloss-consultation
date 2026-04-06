import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import NextButton from "@/Components/NextButton/NextButton";
import Dose from "@/Components/Dose/Dose";
import AddOn from "@/Components/AddOn/AddOn";
import { useRouter } from "next/router";
import useVariationStore from "@/store/useVariationStore";
import useCartStore from "@/store/useCartStore";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import useReorder from "@/store/useReorderStore";
import { abandonCart } from "@/api/abandonCartApi";
import { useMutation } from "@tanstack/react-query";
import useProductId from "@/store/useProductIdStore";
import BackButton from "@/Components/BackButton/BackButton";
import StepsHeader from "@/layout/stepsHeader";
import { MdDelete } from "react-icons/md";
import ConfirmationModal from "@/Components/Modal/ConfirmationModal";
import { Checkbox, FormControlLabel } from "@mui/material";
import MetaLayout from "@/Meta/MetaLayout";
import { meta_url } from "@/config/constants";
import useNeedleConsent from "@/store/needleConsent";
import { FaShoppingCart } from "react-icons/fa";

export default function DosageSelection() {
  const [shownDoseIds, setShownDoseIds] = useState([]);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [abandonData, setAbandonData] = useState([]);
  const router = useRouter();
  const { addToCart, increaseQuantity, decreaseQuantity, items, totalAmount } =
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

  const allowed = variation?.allowed;
  const [showDoseModal, setShowDoseModal] = useState(false);
  const [selectedDose, setSelectedDose] = useState(null);

  const abandonCartMutation = useMutation(abandonCart, {
    onSuccess: (data) => {
      if (data) {
        router.push("/checkout");
        console.log(data, "This is Abandon Cart Data");
      }
    },
    onError: (error) => {
      if (error) {
        router.push("/checkout");
        console.log(error, "This is error");
      }
    },
  });

  //Handle Submit Button
  const onSubmit = () => {
    setIsButtonLoading(true);
    if (
      productId == 4 &&
      items?.addons?.find((addon) => addon.name === "Box of 5 Needles")
    ) {
      abandonCartMutation.mutate(abandonData);
    } else if (productId == 1) {
      abandonCartMutation.mutate(abandonData);
    } else {
      setShowModalForManjaro(true);
    }
  };

  //Allowed checking here 🔥
  const totalSelectedQty = () =>
    items?.doses.reduce((total, v) => total + v.qty, 0);

  // ✅ Put here → outside your component or at the top inside your component file
  const generateProductConcent = (variations, selectedDoseName) => {
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
    const isFirstTwoDose = firstTwoDoses.includes(dose?.name);

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
      setAbandonData([
        ...abandonData,
        {
          eid: dose.id,
          pid: productId,
        },
      ]);
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

      setAbandonData([
        ...abandonData,
        {
          eid: dose.id,
          pid: productId,
        },
      ]);

      // ✅ ✅ ✅ Check if modal was already shown for this dose
      if (!shownDoseIds.includes(dose.id)) {
        setSelectedDose({
          ...dose,
          productConcent: productConcent,
        });
        setShowDoseModal(true);

        // ✅ ✅ ✅ Mark this dose as shown
        setShownDoseIds((prev) => [...prev, dose.id]);
      }
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
  const Back = () => {
    router.push("/confirmation-summary");
  };
  const handleConfirmForManjaro = () => {
    setNeedleMessage(
      "Free needles are not included with Mounjaro. If you'd like to buy needles, add them manually. If you've already have them, please confirm to continue..",
    );
    abandonCartMutation.mutate(abandonData);
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
              className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full"
            >
              <h2 className="text-xl bold-font mb-4 text-gray-800 text-center">
                Needles are not included with Mounjaro
              </h2>

              <p className="text-gray-700 text-md leading-relaxed mb-4 text-center">
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
                className="w-full bold-font mt-2 border border-gray-300 py-3 px-4 rounded text-primary hover:bg-gray-100 cursor-pointer text-md"
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
              className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full"
            >
              <h2 className="text-xl bold-font mb-4 text-gray-800 text-center">
                Dosage Confirmation
              </h2>
              {selectedDose?.productConcent && (
                <p className="text-md paragraph rounded-md p-3 reg-font mb-4">
                  {selectedDose?.productConcent}
                </p>
              )}
              <NextButton
                label=" I Confirm"
                onClick={() => {
                  setShowDoseModal(false);
                }}
              />

              {/* <button
                onClick={() => setShowDoseModal(false)}
                className="w-full mt-2 border border-gray-300 py-2 px-4 rounded text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button> */}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full bg-[#e9f6fa] my-6 rounded-md px-4 sm:px-8">
        <div className="w-full max-w-screen-xl mx-auto my-3 rounded-md">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-12 gap-4 w-full max-w-3xl mx-auto">
              {/* === LEFT COLUMN === */}
              <div className="col-span-12 sm:col-span-8 px-4 md:px-4 py-10">
                <div className="w-full max-w-screen-md mx-auto">
                  <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
                    <div className="bg-[#4565BF] p-4 sm:p-6">
                      <img
                        src={variation?.img}
                        alt={variation?.name}
                        className="w-full h-40 object-contain"
                      />
                    </div>
                    <div className="p-4 sm:p-6">
                      <h2 className="text-xl sm:text-2xl mb-2 sm:mb-4 text-black">
                        {variation?.name}
                      </h2>
                      <span className="text-gray-800 text-sm sm:text-base">
                        From £{variation?.price}
                      </span>

                      {variation?.variations?.[0]?.product_name ===
                        "Mounjaro (Tirzepatide)" && (
                        <p className="py-1 text-md niba-reg-font text-[#1f9e8c] text-start rounded-full">
                          Needles are not included with{" "}
                          <span className="py-1 text-md niba-bold-font text-[#1f9e8c] text-start rounded-full">
                            {" "}
                            Mounjaro
                          </span>
                          . Add them to your order if required.
                        </p>
                      )}
                    </div>
                  </div>

                  <h1 className="my-4 niba-bold-font text-lg sm:text-xl text-black text-start">
                    <span className="niba-reg-font">Choose your </span> Dosage
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

                      return (
                        <Dose
                          key={index}
                          doseData={dose}
                          allow={allowed}
                          qty={cartQty}
                          totalSelectedQty={totalSelectedQty}
                          isSelected={cartQty > 0}
                          onAdd={() => handleAddDose(dose)}
                          onIncrement={() => increaseQuantity(dose.id, "dose")}
                          onDecrement={() => decreaseQuantity(dose.id, "dose")}
                        />
                      );
                    })}

                  {variation?.show_expiry === 1 && (
                    <div className="flex flex-col space-y-2 text-sm py-6">
                      <FormControlLabel
                        control={
                          <Checkbox
                            {...register("terms", {
                              required: isExpiryRequired
                                ? "Please confirm that you have read and acknowledged the expiry information."
                                : false,
                            })}
                            icon={
                              <span className="w-5 h-5 border-2 border-gray-400 rounded-full flex items-center justify-center" />
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
                          <p className="font-sans font-bold text-sm italic text-black">
                            Please confirm that you have reviewed the expiry
                            dates of the selected doses.
                          </p>
                        }
                      />
                      {errors.terms && (
                        <p className="text-red-600 text-xs font-semibold">
                          {errors.terms.message}
                        </p>
                      )}
                    </div>
                  )}

                  {Array.isArray(variation?.addons) &&
                    variation?.addons.length > 0 && (
                      <div className="mt-6">
                        <h1 className="mb-4 niba-reg-font text-lg sm:text-xl text-gray-800">
                          Select{" "}
                          <span className="font-bold text-xl">Add-ons</span>
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
                  <div className="bg-white w-full rounded-xl shadow-lg p-4 sm:max-w-[400px] overflow-hidden">
                    <h2 className="text-lg bold-font mb-4 p-4 text-black">
                      Order Summary
                    </h2>
                    <div className="overflow-y-auto max-h-[300px] space-y-3 scrollbar-thin scrollbar-thumb-gray-300 px-1">
                      {/* === DOSES === */}
                      {items?.doses?.length > 0 ? (
                        items.doses.map((item) => (
                          <React.Fragment key={item.id}>
                            <div className="flex justify-between items-start bg-[#f5f7fb] border border-gray-200 px-4 py-3 rounded-xl shadow-sm">
                              <div className="flex flex-col text-sm text-gray-800 reg-font max-w-[80%]">
                                <span className="line-clamp-2 leading-5">
                                  {item.product} {item.name}, {item.qty}x
                                </span>
                                <span className="font-bold text-black mt-1">
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
                            className="flex justify-between items-start bg-[#f5f7fb] border border-gray-200 px-4 py-3 rounded-xl shadow-sm"
                          >
                            <div className="flex flex-col text-sm text-gray-800 reg-font max-w-[80%]">
                              <span className="line-clamp-2 leading-5">
                                {item.product} {item.name}, {item.qty}x
                              </span>
                              <span className="font-bold text-black mt-1">
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
                    <div className="flex justify-between items-center border-t border-gray-200 pt-4 mt-4 px-1">
                      <span className="text-black bold-font reg-font">
                        Total
                      </span>
                      <span className="text-xl bold-font text-black">
                        £{totalAmount?.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-col sm:flex-row justify-between items-stretch gap-4 mt-6 sm:hidden block">
              <div className="flex justify-between items-center">
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
