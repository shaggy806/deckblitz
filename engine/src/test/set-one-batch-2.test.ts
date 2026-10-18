/**
 * Phyrexia: All Will Be One, batch 2: "has toxic" (the `hasToxic` filter,
 * printed or granted) and "gains toxic N" (the `grant-toxic` effect, rule
 * 702.164b — instances add up). Written from the Oracle text and rulings.
 */
import { describe, expect, it } from "vitest";

import {
  B,
  activate,
  attack,
  cast,
  hand,
  keywords,
  lands,
  pt,
  ref,
  spawn,
  table,
  toHand,
  toLibrary,
  zone,
} from "./harness.js";

const poison = (game: ReturnType<typeof table>["game"], who = B): number => game.state.players[who].counters.poison ?? 0;

describe("Hexgold Slash", () => {
  it("deals 4 to a creature with toxic, 2 to one without", () => {
    const { game } = table();
    const brute = spawn(game, "Venomous Brutalizer", B);
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Hexgold Slash"), { targets: [ref(brute)] });
    cast(game, toHand(game, "Hexgold Slash"), { targets: [ref(giant)] });
    expect(zone(game, brute)).toBe("graveyard");
    expect(zone(game, giant)).toBe("battlefield");
  });

  it("counts toxic granted by an Equipment (Prosthetic Injector)", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const injector = spawn(game, "Prosthetic Injector", B);
    game.state.objects[injector].attachedTo = bears;
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 4 });
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Hexgold Slash"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Aspirant's Ascent", () => {
  it("gives +1/+3, flying and toxic 1 until end of turn", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Island", 1);
    cast(game, toHand(game, "Aspirant's Ascent"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 5 });
    expect(keywords(game, bears).has("flying")).toBe(true);
    attack(game, a, [bears]);
    expect(poison(game)).toBe(1);
  });
});

describe("Plague Nurse", () => {
  it("each other creature you control with toxic gains toxic 1; others don't", () => {
    const { game, a } = table();
    const nurse = spawn(game, "Plague Nurse");
    const stalker = spawn(game, "Branchblight Stalker");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 3);
    activate(game, nurse, 0);
    attack(game, a, [stalker, bears]);
    // Toxic 2 + the granted 1; the Bears had no toxic to begin with.
    expect(poison(game)).toBe(3);
  });
});

describe("Slaughter Singer", () => {
  it("pumps another creature with toxic as it attacks, not one without", () => {
    const { game, a } = table();
    spawn(game, "Slaughter Singer");
    const stalker = spawn(game, "Branchblight Stalker");
    const bears = spawn(game, "Grizzly Bears");
    a.declareAttackersFn = () => [
      { attacker: stalker, defender: B },
      { attacker: bears, defender: B },
    ];
    game.advanceUntil((s) => s.turn.step === "declare-blockers");
    expect(pt(game, stalker)).toEqual({ power: 4, toughness: 2 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Porcelain Zealot and Compleat Devotion", () => {
  it("Compleat Devotion draws only for a creature with toxic", () => {
    const { game } = table();
    const stalker = spawn(game, "Branchblight Stalker");
    const bears = spawn(game, "Grizzly Bears");
    for (let i = 0; i < 3; i += 1) toLibrary(game, "Wastes");
    lands(game, "Plains", 4);
    const start = hand(game).length;
    cast(game, toHand(game, "Compleat Devotion"), { targets: [ref(stalker)] });
    expect(hand(game).length).toBe(start + 1);
    cast(game, toHand(game, "Compleat Devotion"), { targets: [ref(bears)] });
    expect(hand(game).length).toBe(start + 1);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
  });

  it("Porcelain Zealot gives +2/+2 to a creature with toxic", () => {
    const { game, a } = table();
    spawn(game, "Porcelain Zealot");
    const stalker = spawn(game, "Branchblight Stalker");
    a.chooseTargetsFn = () => [ref(stalker)];
    game.advanceUntil((s) => s.turn.step === "begin-combat" && s.zones.shared.stack.length === 0 && s.awaiting === null);
    expect(pt(game, stalker)).toEqual({ power: 5, toughness: 3 });
  });
});
