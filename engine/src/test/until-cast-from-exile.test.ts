/**
 * Activated abilities granted by one-shot effects and statics: "until this card is
 * cast from exile" (`Duration`'s `"until-source-cast"` — Glamorous Outlaw's cycle),
 * "each creature you control with a +1/+1 counter has" a mana ability (Jiang Yanggu),
 * an Aura's restricted one (Leyline Immersion), and "gains all activated abilities of
 * target creature" (Quicksilver Elemental, `grant-activated-of`).
 */
import { describe, expect, it } from "vitest";
import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  activate,
  cast,
  counters,
  enter,
  lands,
  life,
  loyalty,
  nextTurn,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  zone,
} from "./harness.js";

const gameLegal = (game: Game): readonly LegalAction[] => game.legalActions(A);

/** How many ways `A` is offered to activate abilities of `id`. */
const abilityCount = (game: Game, id: ObjectId): number =>
  gameLegal(game).filter((a) => a.kind === "activate-ability" && a.source === id).length;

function exiled(card: string, pay = "Wastes") {
  const t = table();
  const { game } = t;
  const land = spawn(game, "Wastes");
  const paying = lands(game, pay, 2);
  const id = toHand(game, card);
  activate(game, id, 0, { targets: [ref(land)] });
  return { ...t, land, paying, id };
}

describe("until this card is cast from exile (Glamorous Outlaw's cycle)", () => {
  it("exiling it costs {2}, gives the land its ability, and lets it be cast from exile", () => {
    const { game, land, paying, id } = exiled("Glamorous Outlaw");
    expect(zone(game, id)).toBe("exile");
    expect([land, ...paying].filter((p) => game.state.objects[p].tapped)).toHaveLength(2);
    expect(game.state.objects[land].modifiers.some((m) => m.untilCast?.card === id)).toBe(true);
    expect(game.canDispatch({ type: "cast-spell", player: A, card: id, targets: [], via: "impulse" })).not.toBeNull();
  });

  it("the ability's mana pays for the card, and the land loses it once cast", () => {
    const { game, land, id } = exiled("Glamorous Outlaw");
    nextTurn(game);
    nextTurn(game);
    lands(game, "Swamp", 1);
    lands(game, "Mountain", 1);
    lands(game, "Wastes", 2);
    // {3}{U}{B}{R}: only the land's new ability makes the {U}.
    cast(game, id, { via: "impulse" });
    expect(zone(game, id)).toBe("battlefield");
    expect(game.state.objects[land].modifiers.some((m) => m.untilCast !== undefined)).toBe(false);
    expect(life(game, B)).toBe(18);
    expect(game.state.objects[land].tapped).toBe(true);
  });

  it("it lasts across turns, and a card that leaves exile uncast leaves the land its ability (the ruling)", () => {
    const { game, a, land, id } = exiled("Glamorous Outlaw");
    nextTurn(game);
    nextTurn(game);
    expect(game.state.objects[land].modifiers.some((m) => m.untilCast?.card === id)).toBe(true);
    a.chooseTargetsFn = () => [ref(id)];
    enter(game, "Riftsweeper");
    expect(zone(game, id)).toBe("library");
    expect(game.state.objects[land].modifiers.some((m) => m.untilCast?.card === id)).toBe(true);
  });

  it("Masked Bandits' ability makes its own three colours, and Shattered Seraph's its own", () => {
    const { game, land } = exiled("Masked Bandits");
    const granted = game.state.objects[land].modifiers.flatMap((m) => m.grantsActivated ?? []);
    expect(granted[0]?.effect).toMatchObject({ mana: { oneOf: ["B", "R", "G"] } });
    const seraph = exiled("Shattered Seraph");
    const its = seraph.game.state.objects[seraph.land].modifiers.flatMap((m) => m.grantsActivated ?? []);
    expect(its[0]?.effect).toMatchObject({ mana: { oneOf: ["W", "U", "B"] } });
  });
});

describe("Jiang Yanggu, Wildcrafter", () => {
  it("a creature with a +1/+1 counter taps for any colour, one without doesn't", () => {
    const { game } = table();
    const jiang = spawn(game, "Jiang Yanggu, Wildcrafter");
    const bears = spawn(game, "Grizzly Bears");
    const hill = spawn(game, "Hill Giant");
    const before = abilityCount(game, bears);
    loyalty(game, jiang, -1, { targets: [ref(bears)] });
    expect(counters(game, bears)).toBe(1);
    expect(pt(game, bears).power).toBe(3);
    expect(abilityCount(game, bears)).toBeGreaterThan(before);
    expect(abilityCount(game, hill)).toBe(0);
  });

  it("the mana pays for a spell", () => {
    const { game } = table();
    spawn(game, "Jiang Yanggu, Wildcrafter");
    const bears = spawn(game, "Grizzly Bears");
    game.state.objects[bears].counters["+1/+1"] = 1;
    const bolt = toHand(game, "Lightning Bolt");
    cast(game, bolt, { targets: [ref(B)] });
    expect(life(game, B)).toBe(17);
    expect(game.state.objects[bears].tapped).toBe(true);
  });
});

describe("Leyline Immersion", () => {
  function enchanted() {
    const t = table();
    const { game } = t;
    const lord = spawn(game, "Isamaru, Hound of Konda");
    lands(game, "Forest", 4);
    const aura = toHand(game, "Leyline Immersion");
    cast(game, aura, { targets: [ref(lord)] });
    return { ...t, lord, aura };
  }

  it("only enchants a legendary creature", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    const bears = spawn(game, "Grizzly Bears");
    const aura = toHand(game, "Leyline Immersion");
    expect(game.canDispatch({ type: "cast-spell", player: A, card: aura, targets: [ref(bears)] })).not.toBeNull();
  });

  it("gives five mana that pays for a spell, and it's the creature tapped", () => {
    const { game, lord } = enchanted();
    nextTurn(game);
    nextTurn(game);
    const giant = toHand(game, "Hill Giant");
    const canCast = game.canDispatch({ type: "cast-spell", player: A, card: giant, targets: [] });
    expect(canCast).toBeNull();
    cast(game, giant);
    expect(game.state.objects[lord].tapped).toBe(true);
    expect(zone(game, giant)).toBe("battlefield");
  });

  it("gives ward {2}: an opponent's spell is countered unless they pay", () => {
    const { game, lord } = enchanted();
    lands(game, "Mountain", 1, B);
    const bolt = toHand(game, "Lightning Bolt", B);
    game.state.priority.holder = B;
    game.dispatch({ type: "cast-spell", player: B, card: bolt, targets: [ref(lord)] });
    settle(game);
    expect(zone(game, bolt)).toBe("graveyard");
    expect(zone(game, lord)).toBe("battlefield");
  });
});

describe("gains all activated abilities of target creature (Quicksilver Elemental)", () => {
  it("gathers what the target has as it resolves, this turn, and more with each", () => {
    const { game } = table();
    const silver = spawn(game, "Quicksilver Elemental");
    lands(game, "Island", 4);
    const elves = spawn(game, "Llanowar Elves", B);
    const before = game.state.objects[silver].modifiers.length;
    activate(game, silver, 0, { targets: [ref(elves)] });
    expect(game.state.objects[silver].modifiers.length).toBe(before + 1);
    const granted = game.state.objects[silver].modifiers.flatMap((m) => m.grantsActivated ?? []);
    expect(granted).toHaveLength(1);
    expect(granted[0].effect).toMatchObject({ kind: "add-mana", mana: "G" });
    // The Elves still have theirs.
    expect(game.state.objects[elves].zone).toBe("battlefield");
    const pinger = spawn(game, "Prodigal Sorcerer", B);
    activate(game, silver, 0, { targets: [ref(pinger)] });
    const both = game.state.objects[silver].modifiers.flatMap((m) => m.grantsActivated ?? []);
    expect(both).toHaveLength(2);
    nextTurn(game);
    expect(game.state.objects[silver].modifiers.flatMap((m) => m.grantsActivated ?? [])).toHaveLength(0);
  });

  it("this creature activates them itself, and blue mana pays an off-colour one", () => {
    const { game } = table();
    const silver = spawn(game, "Quicksilver Elemental");
    lands(game, "Island", 2);
    const shade = spawn(game, "Looming Shade", B);
    activate(game, silver, 0, { targets: [ref(shade)] });
    expect(game.state.objects[silver].modifiers.flatMap((m) => m.grantsActivated ?? [])).toHaveLength(1);
    // Looming Shade's "{B}: This creature gets +1/+1 until end of turn." Paid in blue,
    // and it's the Elemental that grows.
    activate(game, silver, 1);
    expect(pt(game, silver).power).toBe(4);
    expect(pt(game, shade).power).toBe(1);
  });

  it("blue mana doesn't pay for anything else as any colour", () => {
    const { game } = table();
    spawn(game, "Quicksilver Elemental");
    lands(game, "Island", 1);
    const bolt = toHand(game, "Lightning Bolt");
    expect(game.canDispatch({ type: "cast-spell", player: A, card: bolt, targets: [ref(B)] })).not.toBeNull();
  });
});
