import { describe, expect, it } from "vitest";
import { A, B, cast, controller, lands, ref, settle, spawn, table, toHand, toStep } from "./harness.js";

// "You can't choose an untapped permanent as this spell's target as you cast
// it" (Dream Leash): a permanent slot's `asChosen` requirement, read only as
// the target is chosen (rule 601.2c) — not as the spell resolves (608.2b),
// nor as the Aura's enchant ability (303.4a).
describe("a target requirement read only as the spell is cast (Dream Leash)", () => {
  it("can't choose an untapped permanent, and can choose a tapped one", () => {
    const { game } = table();
    lands(game, "Island", 5);
    const untapped = spawn(game, "Grizzly Bears", B);
    const tapped = spawn(game, "Hill Giant", B, { tapped: true });
    const leash = toHand(game, "Dream Leash");
    expect(() => cast(game, leash, { targets: [ref(untapped)] })).toThrow(/target/i);
    cast(game, leash, { targets: [ref(tapped)] });
    expect(game.state.objects[leash].zone).toBe("battlefield");
    expect(game.state.objects[leash].attachedTo).toBe(tapped);
    expect(controller(game, tapped)).toBe(A);
  });

  it("resolves onto a target that untapped while it was on the stack", () => {
    const { game } = table();
    lands(game, "Island", 5);
    const target = spawn(game, "Hill Giant", B, { tapped: true });
    const leash = toHand(game, "Dream Leash");
    cast(game, leash, { targets: [ref(target)], settle: false });
    game.debugApplyEffect(A, { kind: "untap", target: 0 }, [ref(target)]);
    settle(game);
    expect(game.state.objects[leash].attachedTo).toBe(target);
    expect(controller(game, target)).toBe(A);
  });

  it("stays attached once its permanent untaps, and moves onto an untapped one", () => {
    const { game } = table();
    lands(game, "Island", 5);
    const target = spawn(game, "Hill Giant", B, { tapped: true });
    const other = spawn(game, "Grizzly Bears", B);
    const leash = toHand(game, "Dream Leash");
    cast(game, leash, { targets: [ref(target)] });
    game.debugApplyEffect(A, { kind: "untap", target: 0 }, [ref(target)]);
    settle(game);
    expect(game.state.objects[leash].attachedTo).toBe(target);
    expect(controller(game, target)).toBe(A);
    // An effect that moves it needs no tapped permanent (the ruling).
    game.debugApplyEffect(A, { kind: "attach", target: 0, attachment: 1 }, [ref(other), ref(leash)]);
    toStep(game, "begin-combat");
    expect(game.state.objects[leash].attachedTo).toBe(other);
    expect(controller(game, other)).toBe(A);
    expect(controller(game, target)).toBe(B);
  });
});

// Enthralling Hold: the same on "Enchant creature" — and a target changed on
// the stack (rule 115.7) may be an untapped creature (its ruling).
describe("Enthralling Hold: a tapped creature only as it's cast", () => {
  it("takes a tapped creature, never an untapped one or a tapped noncreature", () => {
    const { game } = table();
    lands(game, "Island", 5);
    const untapped = spawn(game, "Grizzly Bears", B);
    const land = spawn(game, "Forest", B, { tapped: true });
    const tapped = spawn(game, "Hill Giant", B, { tapped: true });
    const hold = toHand(game, "Enthralling Hold");
    expect(() => cast(game, hold, { targets: [ref(untapped)] })).toThrow(/target/i);
    expect(() => cast(game, hold, { targets: [ref(land)] })).toThrow(/target/i);
    cast(game, hold, { targets: [ref(tapped)] });
    expect(game.state.objects[hold].attachedTo).toBe(tapped);
    expect(controller(game, tapped)).toBe(A);
    game.debugApplyEffect(A, { kind: "untap", target: 0 }, [ref(tapped)]);
    toStep(game, "begin-combat");
    expect(game.state.objects[hold].attachedTo).toBe(tapped);
    expect(controller(game, tapped)).toBe(A);
  });

  it("a target changed on the stack may be an untapped creature", () => {
    const { game } = table();
    lands(game, "Island", 5);
    const tapped = spawn(game, "Hill Giant", B, { tapped: true });
    const untapped = spawn(game, "Grizzly Bears", B);
    const hold = toHand(game, "Enthralling Hold");
    cast(game, hold, { targets: [ref(tapped)], settle: false });
    // The one other legal target is taken at once (rule 115.7a).
    game.debugApplyEffect(B, { kind: "change-targets", target: 0, how: "change" }, [ref(hold)]);
    expect(game.state.objects[hold].targets).toEqual([ref(untapped)]);
    settle(game);
    expect(game.state.objects[hold].attachedTo).toBe(untapped);
    expect(controller(game, untapped)).toBe(A);
    expect(controller(game, tapped)).toBe(B);
  });
});
