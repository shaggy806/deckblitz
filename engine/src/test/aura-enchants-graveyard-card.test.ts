/**
 * Auras that enchant a card in a graveyard and then swap their enchant
 * ability (Animate Dead, Dance of the Dead), and an enchantment that becomes
 * such an Aura (Necromancy): `enchantsGraveyardCard`, the
 * `swap-enchant` effect and `GameObject.enchantSwap`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  cast,
  controller,
  destroy,
  graveyard,
  lands,
  nextTurn,
  pt,
  quiet,
  ref,
  spawn,
  subtypes,
  table,
  toGraveyard,
  toHand,
  types,
  zone,
} from "./harness.js";

const attachedTo = (game: Game, id: ObjectId): ObjectId | null => game.state.objects[id].attachedTo;
const swamps = (game: Game, n: number): void => void lands(game, "Swamp", n);

describe("Animate Dead", () => {
  it("returns the creature card it enchants under your control and attaches to it", () => {
    const { game } = table();
    const bears = toGraveyard(game, "Grizzly Bears", B);
    const animate = toHand(game, "Animate Dead");
    swamps(game, 2);
    cast(game, animate, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
    expect(controller(game, bears)).toBe(A);
    expect(zone(game, animate)).toBe("battlefield");
    expect(attachedTo(game, animate)).toBe(bears);
    expect(pt(game, bears)).toEqual({ power: 1, toughness: 2 });
  });

  it("enters attached to the card, which its statics don't reach there", () => {
    const { game } = table();
    const bears = toGraveyard(game, "Grizzly Bears", B);
    const animate = toHand(game, "Animate Dead");
    swamps(game, 2);
    cast(game, animate, { targets: [ref(bears)], settle: false });
    // Resolve the spell only: its enters ability waits on the stack.
    game.advanceUntil((s) => s.zones.shared.stack.length === 1 && s.zones.shared.stack[0] !== animate);
    expect(zone(game, animate)).toBe("battlefield");
    expect(attachedTo(game, animate)).toBe(bears);
    expect(zone(game, bears)).toBe("graveyard");
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });

  it("goes to the graveyard, returning nothing, if the card leaves the graveyard first", () => {
    const { game } = table();
    const bears = toGraveyard(game, "Grizzly Bears", B);
    const animate = toHand(game, "Animate Dead");
    swamps(game, 2);
    cast(game, animate, { targets: [ref(bears)], settle: false });
    game.advanceUntil((s) => s.zones.shared.stack.length === 1 && s.zones.shared.stack[0] !== animate);
    // In response, the card is exiled (rule 400.7) — the Aura is attached
    // to nothing, and the state-based check puts it into the graveyard.
    game.debugMove(bears, "exile");
    game.advanceUntil(quiet);
    expect(zone(game, bears)).toBe("exile");
    expect(zone(game, animate)).toBe("graveyard");
  });

  it("can't be attached to anything else once the creature is back", () => {
    const { game } = table();
    const bears = toGraveyard(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant");
    const animate = toHand(game, "Animate Dead");
    swamps(game, 2);
    cast(game, animate, { targets: [ref(bears)] });
    game.debugApplyEffect(A, { kind: "attach", target: 0 }, [ref(giant)], { source: animate });
    expect(attachedTo(game, animate)).toBe(bears);
  });

  it("leaving the battlefield, has that creature's controller sacrifice it", () => {
    const { game } = table();
    const bears = toGraveyard(game, "Grizzly Bears", B);
    const animate = toHand(game, "Animate Dead");
    swamps(game, 2);
    cast(game, animate, { targets: [ref(bears)] });
    destroy(game, animate);
    expect(zone(game, animate)).toBe("graveyard");
    expect(graveyard(game, B)).toContain(bears);
  });

  it("falls off a creature that stops being one, and still takes it with it", () => {
    const { game } = table();
    const bears = toGraveyard(game, "Grizzly Bears", B);
    const animate = toHand(game, "Animate Dead");
    swamps(game, 2);
    cast(game, animate, { targets: [ref(bears)] });
    game.debugApplyEffect(A, { kind: "add-types", target: 0, setTypes: ["artifact"], duration: "permanent" }, [ref(bears)]);
    expect(types(game, bears)).toEqual(["artifact"]);
    // The state-based check, as the next spell resolves.
    swamps(game, 1);
    cast(game, toHand(game, "Dark Ritual"));
    expect(zone(game, animate)).toBe("graveyard");
    expect(graveyard(game, B)).toContain(bears);
  });

  it("put onto the battlefield without being cast, enchants a creature card in a graveyard (rule 303.4f)", () => {
    const { game } = table();
    const bears = toGraveyard(game, "Grizzly Bears", B);
    spawn(game, "Hill Giant");
    const animate = toGraveyard(game, "Animate Dead");
    game.debugApplyEffect(A, { kind: "put-onto-battlefield", target: 0, underYourControl: true }, [ref(animate)]);
    // Only the graveyard card: a creature on the battlefield isn't a
    // creature card in a graveyard. (Animate Dead itself is in one, but
    // isn't a creature card.)
    expect(game.state.awaiting).toMatchObject({ kind: "choose-enchant", source: animate, options: [bears] });
    game.dispatch({ type: "choose-enchant", player: A, enchant: bears });
    game.advanceUntil(quiet);
    expect(zone(game, bears)).toBe("battlefield");
    expect(controller(game, bears)).toBe(A);
    expect(attachedTo(game, animate)).toBe(bears);
  });

  it("with no creature card in any graveyard, stays where it is", () => {
    const { game } = table();
    spawn(game, "Grizzly Bears");
    const animate = toGraveyard(game, "Animate Dead");
    game.debugApplyEffect(A, { kind: "put-onto-battlefield", target: 0, underYourControl: true }, [ref(animate)]);
    game.advanceUntil(quiet);
    expect(zone(game, animate)).toBe("graveyard");
  });

  it("a creature with protection from black comes back, but the Aura can't attach, and the creature is sacrificed", () => {
    const { game } = table();
    // Protection works only on the battlefield: it can be enchanted in the
    // graveyard (the ruling), but not once it's back.
    const knight = toGraveyard(game, "White Knight", B);
    const animate = toHand(game, "Animate Dead");
    swamps(game, 2);
    cast(game, animate, { targets: [ref(knight)] });
    expect(zone(game, animate)).toBe("graveyard");
    expect(graveyard(game, B)).toContain(knight);
  });
});

describe("Dance of the Dead", () => {
  it("returns the card tapped, +1/+1, and it doesn't untap", () => {
    const { game } = table();
    const bears = toGraveyard(game, "Grizzly Bears", B);
    const dance = toHand(game, "Dance of the Dead");
    swamps(game, 2);
    cast(game, dance, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(attachedTo(game, dance)).toBe(bears);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(game.characteristics(bears).restrictions.has("doesnt-untap")).toBe(true);
  });
});

describe("Necromancy", () => {
  it("becomes an Aura attached to the creature it returns", () => {
    const { game } = table();
    const bears = toGraveyard(game, "Grizzly Bears", B);
    const necro = toHand(game, "Necromancy");
    swamps(game, 3);
    cast(game, necro);
    expect(game.state.awaiting).toBeNull();
    // The seat's default answer to the enters ability's target: the only one.
    expect(zone(game, bears)).toBe("battlefield");
    expect(controller(game, bears)).toBe(A);
    expect(attachedTo(game, necro)).toBe(bears);
    expect(subtypes(game, necro)).toEqual(["Aura"]);
    // And stays there: it's an Aura the state-based check accepts.
    game.advanceUntil(quiet);
    expect(zone(game, necro)).toBe("battlefield");
    destroy(game, necro);
    expect(graveyard(game, B)).toContain(bears);
  });

  it("cast at instant speed, the Aura it became is sacrificed at cleanup, and the creature with it", () => {
    const { game } = table({ step: "end" });
    const bears = toGraveyard(game, "Grizzly Bears", B);
    const necro = toHand(game, "Necromancy");
    swamps(game, 3);
    cast(game, necro);
    expect(attachedTo(game, necro)).toBe(bears);
    nextTurn(game);
    expect(zone(game, necro)).toBe("graveyard");
    expect(graveyard(game, B)).toContain(bears);
  });

  it("with its target gone, stays a plain enchantment", () => {
    const { game } = table();
    const bears = toGraveyard(game, "Grizzly Bears", B);
    const necro = toHand(game, "Necromancy");
    swamps(game, 3);
    cast(game, necro, { settle: false });
    game.advanceUntil((s) => s.zones.shared.stack.length === 1 && s.zones.shared.stack[0] !== necro);
    game.debugMove(bears, "exile");
    game.advanceUntil(quiet);
    expect(zone(game, necro)).toBe("battlefield");
    expect(subtypes(game, necro)).toEqual([]);
    expect(attachedTo(game, necro)).toBeNull();
  });
});

describe("Cloudform", () => {
  it("becomes an Aura with enchant creature on the creature it manifests", () => {
    const { game } = table();
    const form = toHand(game, "Cloudform");
    lands(game, "Island", 3);
    cast(game, form);
    const host = attachedTo(game, form);
    if (host === null) throw new Error("Cloudform attached to nothing");
    expect(game.state.objects[host].faceDown).toBeDefined();
    expect(subtypes(game, form)).toEqual(["Aura"]);
    expect(pt(game, host)).toEqual({ power: 2, toughness: 2 });
    expect(game.characteristics(host).keywords.has("hexproof")).toBe(true);
  });

  it("can then move to another creature: its enchant ability is enchant creature", () => {
    const { game } = table();
    const form = toHand(game, "Cloudform");
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Island", 3);
    cast(game, form);
    game.debugApplyEffect(A, { kind: "attach", target: 0 }, [ref(giant)], { source: form });
    expect(attachedTo(game, form)).toBe(giant);
    expect(game.characteristics(giant).keywords.has("flying")).toBe(true);
  });

  it("with an empty library, manifests nothing and goes to the graveyard", () => {
    const { game } = table();
    game.state.zones.perPlayer[A].library.length = 0;
    const form = toHand(game, "Cloudform");
    lands(game, "Island", 3);
    cast(game, form);
    expect(zone(game, form)).toBe("graveyard");
  });
});
