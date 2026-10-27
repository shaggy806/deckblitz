/**
 * Champions of Kamigawa (CHK; B212), group B — the rest of the set. One test
 * per card whose behaviour is more than a stat line, on the clause most likely
 * to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  cast,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  named,
  pt,
  quiet,
  ref,
  spawn,
  table,
  toHand,
  toLibrary,
  zone,
} from "./harness.js";
import type { Game } from "../game.js";

/** State-based actions run as a player would get priority: move on a step (the legend rule is one, 704.5j). */
const checkBoard = (game: Game): void => {
  const step = game.state.turn.step;
  game.advanceUntil((st) => st.turn.step !== step && st.priority.holder === A && quiet(st));
};

describe("Brothers Yamazaki", () => {
  it("two of them dodge the legend rule and pump each other; a third brings it back", () => {
    const { game } = table();
    const first = enter(game, "Brothers Yamazaki");
    expect(pt(game, first)).toEqual({ power: 2, toughness: 1 });
    const second = enter(game, "Brothers Yamazaki");
    checkBoard(game);
    expect(named(game, "Brothers Yamazaki", A)).toHaveLength(2);
    expect(pt(game, first)).toEqual({ power: 4, toughness: 3 });
    expect(pt(game, second)).toEqual({ power: 4, toughness: 3 });
    expect(keywords(game, first).has("haste")).toBe(true);
    enter(game, "Brothers Yamazaki");
    checkBoard(game);
    expect(named(game, "Brothers Yamazaki", A)).toHaveLength(1);
  });

  it("pumps an opponent's Brothers too, and counts theirs toward the two", () => {
    const { game } = table();
    const mine = enter(game, "Brothers Yamazaki");
    const theirs = enter(game, "Brothers Yamazaki", B);
    checkBoard(game);
    expect(pt(game, theirs)).toEqual({ power: 4, toughness: 3 });
    expect(pt(game, mine)).toEqual({ power: 4, toughness: 3 });
    // A second one of mine makes three on the battlefield: the legend rule applies to my two.
    enter(game, "Brothers Yamazaki");
    checkBoard(game);
    expect(named(game, "Brothers Yamazaki", A)).toHaveLength(1);
    expect(named(game, "Brothers Yamazaki", B)).toHaveLength(1);
  });
});

describe("Callous Deceiver", () => {
  it("gets +1/+0 and flying when the revealed card is a land, once each turn", () => {
    const { game } = table();
    const deceiver = spawn(game, "Callous Deceiver");
    lands(game, "Wastes", 4);
    activate(game, deceiver, 1);
    expect(pt(game, deceiver)).toEqual({ power: 2, toughness: 3 });
    expect(keywords(game, deceiver).has("flying")).toBe(true);
    expect(() => activate(game, deceiver, 1)).toThrow();
  });

  it("does nothing when the revealed card isn't a land", () => {
    const { game } = table();
    const deceiver = spawn(game, "Callous Deceiver");
    lands(game, "Wastes", 2);
    toLibrary(game, "Grizzly Bears");
    activate(game, deceiver, 1);
    expect(pt(game, deceiver)).toEqual({ power: 1, toughness: 3 });
    expect(keywords(game, deceiver).has("flying")).toBe(false);
  });

  it("shows its controller the top card and leaves it there", () => {
    const { game, a } = table();
    const deceiver = spawn(game, "Callous Deceiver");
    lands(game, "Wastes", 1);
    const top = toLibrary(game, "Grizzly Bears");
    const before = hand(game).length;
    const shown: (readonly unknown[])[] = [];
    a.chooseFromZoneFn = () => {
      const asked = game.state.awaiting;
      shown.push(asked?.kind === "choose-from-zone" ? asked.ids : []);
      return [];
    };
    activate(game, deceiver, 0);
    expect(shown).toEqual([[top]]);
    expect(game.state.zones.perPlayer[A].library[0]).toBe(top);
    expect(hand(game)).toHaveLength(before);
  });
});

describe("Harsh Deceiver", () => {
  it("untaps and gets +1/+1 when the revealed card is a land", () => {
    const { game } = table();
    const deceiver = spawn(game, "Harsh Deceiver", A, { tapped: true });
    lands(game, "Wastes", 2);
    activate(game, deceiver, 1);
    expect(game.state.objects[deceiver].tapped).toBe(false);
    expect(pt(game, deceiver)).toEqual({ power: 2, toughness: 5 });
  });
});

describe("Pain Kami and Crushing Pain", () => {
  it("Pain Kami deals X; Crushing Pain targets only a creature dealt damage this turn", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const giant = spawn(game, "Hill Giant", B);
    const fresh = spawn(game, "Hill Giant", B);
    const kami = spawn(game, "Pain Kami");
    activate(game, kami, 0, { x: 1, targets: [ref(giant)] });
    expect(zone(game, kami)).toBe("graveyard");
    expect(zone(game, giant)).toBe("battlefield");
    const pain = toHand(game, "Crushing Pain");
    expect(() => cast(game, pain, { targets: [ref(fresh)] })).toThrow();
    cast(game, pain, { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, fresh)).toBe("battlefield");
  });
});

describe("Earthshaker", () => {
  it("deals 2 to each creature without flying when you cast an Arcane spell", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    spawn(game, "Earthshaker");
    const bears = spawn(game, "Grizzly Bears", B);
    const angel = spawn(game, "Serra Angel", B);
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Rend Flesh"), { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, angel)).toBe("battlefield");
    expect(graveyard(game, B)).toContain(bears);
  });
});
