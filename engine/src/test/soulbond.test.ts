/**
 * Soulbond (rule 702.95): a creature with soulbond may pair with another
 * unpaired creature its controller controls as either enters (two triggered
 * abilities, `soulbond()`); a static with `affects: { scope: "paired" }`
 * applies to both while they're paired; the pairing ends for good when either
 * leaves, changes control or stops being a creature (702.95e).
 */
import { describe, expect, it } from "vitest";

import {
  A,
  activate,
  B,
  cast,
  controller,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  pickModes,
  pickPermanents,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  zone,
} from "./harness.js";

const pairedWith = (game: ReturnType<typeof table>["game"], id: string): string | undefined =>
  game.state.objects[id as never]?.pairedWith;

describe("soulbond", () => {
  it("pairs as the soulbond creature enters, with a creature its controller chooses", () => {
    const { game, a } = table();
    const bear = spawn(game, "Grizzly Bears");
    const other = spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears", B);
    const seen = pickPermanents(a, other);
    const paladin = enter(game, "Silverblade Paladin");
    // Only its controller's other unpaired creatures are offered.
    expect([...seen.offered].sort()).toEqual([bear, other].sort());
    expect(pairedWith(game, paladin)).toBe(other);
    expect(pairedWith(game, other)).toBe(paladin);
    expect(keywords(game, paladin).has("double-strike")).toBe(true);
    expect(keywords(game, other).has("double-strike")).toBe(true);
    expect(keywords(game, bear).has("double-strike")).toBe(false);
  });

  it("may decline: choosing nothing leaves both unpaired", () => {
    const { game, a } = table();
    const bear = spawn(game, "Grizzly Bears");
    pickPermanents(a);
    const paladin = enter(game, "Silverblade Paladin");
    expect(pairedWith(game, paladin)).toBeUndefined();
    expect(keywords(game, bear).has("double-strike")).toBe(false);
    expect(keywords(game, paladin).has("double-strike")).toBe(false);
  });

  it("doesn't trigger alone: no other unpaired creature", () => {
    const { game } = table();
    const familiar = enter(game, "Druid's Familiar");
    expect(pairedWith(game, familiar)).toBeUndefined();
    expect(pt(game, familiar)).toEqual({ power: 2, toughness: 2 });
  });

  it("pairs with another creature that enters later, if both are unpaired", () => {
    const { game, a } = table();
    const familiar = spawn(game, "Druid's Familiar");
    pickModes(a, 0);
    const bear = enter(game, "Grizzly Bears");
    expect(pairedWith(game, familiar)).toBe(bear);
    expect(pt(game, bear)).toEqual({ power: 4, toughness: 4 });
    expect(pt(game, familiar)).toEqual({ power: 4, toughness: 4 });
    // Both paired: a third creature entering triggers nothing more.
    const third = enter(game, "Grizzly Bears");
    expect(pairedWith(game, third)).toBeUndefined();
    expect(pt(game, third)).toEqual({ power: 2, toughness: 2 });
    // An opponent's creature never triggers it.
    const theirs = enter(game, "Grizzly Bears", B);
    expect(pairedWith(game, theirs)).toBeUndefined();
  });

  it("a creature already paired can't pair again; two soulbond creatures pair with each other", () => {
    const { game, a } = table();
    const familiar = spawn(game, "Druid's Familiar");
    pickModes(a, 0);
    pickPermanents(a, familiar);
    const wolfir = enter(game, "Wolfir Silverheart");
    expect(pairedWith(game, wolfir)).toBe(familiar);
    // Each one's bonus reaches both: +2/+2 and +4/+4.
    expect(pt(game, familiar)).toEqual({ power: 8, toughness: 8 });
    expect(pt(game, wolfir)).toEqual({ power: 10, toughness: 10 });
  });

  /** Alice bolts `target`: a real resolution, so the state-based check runs. */
  const bolt = (game: ReturnType<typeof table>["game"], target: string): void => {
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(target as never)] });
  };

  it("leaving the battlefield unpairs both for good (rule 702.95e)", () => {
    const { game, a } = table();
    const bear = spawn(game, "Grizzly Bears");
    pickPermanents(a, bear);
    const mauler = enter(game, "Lightning Mauler");
    expect(keywords(game, bear).has("haste")).toBe(true);
    bolt(game, mauler);
    expect(zone(game, mauler)).toBe("graveyard");
    expect(pairedWith(game, bear)).toBeUndefined();
    expect(keywords(game, bear).has("haste")).toBe(false);
  });

  it("a change of control unpairs them, and they stay unpaired once it's back", () => {
    const { game, a } = table();
    const bear = spawn(game, "Grizzly Bears");
    pickPermanents(a, bear);
    const mauler = enter(game, "Lightning Mauler");
    expect(keywords(game, bear).has("haste")).toBe(true);
    game.debugApplyEffect(B, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(bear)]);
    expect(keywords(game, bear).has("haste")).toBe(false);
    bolt(game, B);
    expect(pairedWith(game, mauler)).toBeUndefined();
    expect(pairedWith(game, bear)).toBeUndefined();
    game.debugApplyEffect(A, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(bear)]);
    bolt(game, B);
    expect(controller(game, bear)).toBe(A);
    expect(keywords(game, bear).has("haste")).toBe(false);
    expect(keywords(game, mauler).has("haste")).toBe(false);
  });

  it("grants triggered abilities to both: Doom Weaver's partner draws as it dies", () => {
    const { game, a } = table();
    const bear = spawn(game, "Grizzly Bears");
    pickPermanents(a, bear);
    enter(game, "Doom Weaver");
    const before = hand(game).length;
    destroy(game, bear);
    settle(game);
    expect(graveyard(game)).toContain(bear);
    // Its power as it last existed: 2.
    expect(hand(game).length).toBe(before + 2);
  });

  it("grants activated abilities to both: Deadeye Navigator's blink breaks the pair, which re-forms", () => {
    const { game, a } = table();
    const bear = spawn(game, "Grizzly Bears");
    pickPermanents(a, bear);
    const navigator = enter(game, "Deadeye Navigator");
    expect(pairedWith(game, navigator)).toBe(bear);
    expect(game.viewFor(A).objects[navigator]?.pairedWith).toBe(bear);
    lands(game, "Island", 2);
    // The bear blinks: unpaired as it leaves, then Navigator's soulbond
    // triggers on its return and they pair again (the rulings).
    pickModes(a, 0);
    activate(game, bear);
    const back = game.state.zones.shared.battlefield.find(
      (id) => id !== navigator && game.state.objects[id].cardName === "Grizzly Bears",
    )!;
    expect(pairedWith(game, navigator)).toBe(back);
    expect(pairedWith(game, back)).toBe(navigator);
  });
});
