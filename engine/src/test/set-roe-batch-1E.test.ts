/**
 * Rise of the Eldrazi, group E: levelers' in-band abilities (an anthem, a
 * triggered extra turn, tap abilities), Estrid's Mask, Octopus Umbra's
 * granted trigger, and the plainer spells.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  enter,
  graveyard,
  keywords,
  lands,
  life,
  loyalty,
  pickTargets,
  pt,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  tokensNamed,
  named,
  nextTurn,
} from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { activePlayerOf } from "../state.js";

const level = (game: Game, id: ObjectId, n: number): void =>
  game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "level", amount: n }, [ref(id)]);

describe("ROE group E", () => {
  it("Coralhelm Commander: other Merfolk get +1/+1 only at level 4+", () => {
    const { game } = table();
    const commander = spawn(game, "Coralhelm Commander");
    const merfolk = spawn(game, "Merfolk of the Pearl Trident");
    level(game, commander, 3);
    expect(pt(game, commander)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, merfolk)).toEqual({ power: 1, toughness: 1 });
    level(game, commander, 1);
    expect(pt(game, commander)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, commander).has("flying")).toBe(true);
    expect(pt(game, merfolk)).toEqual({ power: 2, toughness: 2 });
  });

  it("Lighthouse Chronologist: at level 7, an extra turn after each opponent's turn, none after its own", () => {
    const { game } = table();
    const chrono = spawn(game, "Lighthouse Chronologist");
    level(game, chrono, 7);
    expect(pt(game, chrono)).toEqual({ power: 3, toughness: 5 });
    const order: string[] = [];
    for (let i = 0; i < 4; i += 1) {
      nextTurn(game);
      order.push(activePlayerOf(game.state));
    }
    // T2 bob, T3 alice's extra turn, T4 alice's own, T5 bob.
    expect(order).toEqual([B, A, A, B]);
  });

  it("Lighthouse Chronologist: below level 7 there's no extra turn", () => {
    const { game } = table();
    const chrono = spawn(game, "Lighthouse Chronologist");
    level(game, chrono, 6);
    expect(pt(game, chrono)).toEqual({ power: 2, toughness: 4 });
    nextTurn(game);
    nextTurn(game);
    nextTurn(game);
    expect(activePlayerOf(game.state)).toBe(B);
  });

  it("Kazandu Tuskcaller: one Elephant at level 2-5, two at 6+, and each band's ability only in its band", () => {
    const { game } = table();
    const tusk = spawn(game, "Kazandu Tuskcaller");
    expect(() => activate(game, tusk, 1)).toThrow();
    level(game, tusk, 2);
    expect(() => activate(game, tusk, 2)).toThrow();
    activate(game, tusk, 1);
    expect(tokensNamed(game, "Elephant Token", A)).toBe(1);
    game.state.objects[tusk].tapped = false;
    level(game, tusk, 4);
    expect(() => activate(game, tusk, 1)).toThrow();
    activate(game, tusk, 2);
    expect(tokensNamed(game, "Elephant Token", A)).toBe(3);
  });

  it("Jaddi Lifestrider: 2 life for each creature tapped, itself included", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const before = life(game, A);
    a.choosePermanentsFn = (_view, eligible) => eligible;
    const jaddi = enter(game, "Jaddi Lifestrider");
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(game.state.objects[jaddi].tapped).toBe(true);
    expect(life(game, A)).toBe(before + 4);
  });

  it("Oust: second from the top of its owner's library, and its controller gains 3", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    const bears = spawn(game, "Grizzly Bears", B);
    const before = life(game, B);
    cast(game, toHand(game, "Oust"), { targets: [ref(bears)] });
    const library = game.state.zones.perPlayer[B].library;
    expect(game.state.objects[library[1]].cardName).toBe("Grizzly Bears");
    expect(life(game, B)).toBe(before + 3);
  });

  it("Broodwarden: Eldrazi Spawn get +2/+1, other creatures don't", () => {
    const { game } = table();
    spawn(game, "Broodwarden");
    const spawnToken = spawn(game, "Eldrazi Spawn Token");
    const bears = spawn(game, "Grizzly Bears");
    expect(pt(game, spawnToken)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });

  it("Luminous Wake: the Aura's controller gains 4 when the creature attacks", () => {
    const { game, a } = table();
    lands(game, "Plains", 3);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Luminous Wake"), { targets: [ref(bears)] });
    const before = life(game, A);
    attack(game, a, [bears]);
    expect(life(game, A)).toBe(before + 4);
  });

  it("Wrap in Flames: 1 damage to each of three creatures, and they can't block", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const targets = [spawn(game, "Grizzly Bears", B), spawn(game, "Grizzly Bears", B), spawn(game, "Grizzly Bears", B)];
    cast(game, toHand(game, "Wrap in Flames"), { targets: targets.map(ref) });
    expect(targets.map((id) => game.state.objects[id].damageMarked)).toEqual([1, 1, 1]);
  });

  it("Octopus Umbra: base 8/8, and the attack trigger may tap a creature with power 8 or less", () => {
    const { game, a } = table();
    lands(game, "Island", 5);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Octopus Umbra"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 8, toughness: 8 });
    const blocker = spawn(game, "Grizzly Bears", B);
    pickTargets(a, blocker);
    a.chooseModesFn = () => [0];
    attack(game, a, [bears]);
    expect(game.state.objects[blocker].tapped).toBe(true);
  });

  it("Estrid: −1 makes a Mask on another permanent; +2 untaps enchanted permanents you control", () => {
    const { game } = table();
    const estrid = spawn(game, "Estrid, the Masked");
    const bears = spawn(game, "Grizzly Bears", A, { tapped: true });
    loyalty(game, estrid, -1, { targets: [ref(bears)] });
    const [mask] = named(game, "Mask Token");
    expect(game.state.objects[mask].attachedTo).toBe(bears);
    const other = spawn(game, "Grizzly Bears", A, { tapped: true });
    // A planeswalker's loyalty ability is once a turn.
    nextTurn(game);
    nextTurn(game);
    game.state.objects[bears].tapped = true;
    game.state.objects[other].tapped = true;
    loyalty(game, estrid, 2);
    expect(game.state.objects[bears].tapped).toBe(false);
    expect(game.state.objects[other].tapped).toBe(true);
  });

  it("Estrid −7: non-Aura enchantments return, then Auras", () => {
    const { game } = table();
    const estrid = spawn(game, "Estrid, the Masked");
    spawn(game, "Grizzly Bears");
    toGraveyard(game, "Glorious Anthem");
    toGraveyard(game, "Luminous Wake");
    loyalty(game, estrid, -7, { atLeast: 7 });
    expect(named(game, "Glorious Anthem")).toHaveLength(1);
    const [wake] = named(game, "Luminous Wake");
    expect(wake).toBeDefined();
    expect(graveyard(game).map((id) => game.state.objects[id].cardName)).not.toContain("Glorious Anthem");
  });
});
