/**
 * References to what the source is attached to, and to what's attached to a
 * permanent: statics on the host's color, types, controller and other
 * attachments, "other than enchanted creature", and `attachments`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  B,
  activate,
  cast,
  controller,
  destroy,
  keywords,
  lands,
  pickPermanents,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  zone,
} from "./harness.js";

/** `name` on the battlefield, attached to `host`. */
const on = (game: Game, name: string, host: ObjectId, player: PlayerId = A): ObjectId => {
  const id = spawn(game, name, player);
  game.state.objects[id].attachedTo = host;
  return id;
};

describe("Konda's Banner: a filter over the host's colors and creature types", () => {
  it("each creature sharing a color or a creature type gets +1/+1, each once", () => {
    const { game } = table();
    const host = spawn(game, "Isamaru, Hound of Konda");
    on(game, "Konda's Banner", host);
    // White: shares a color only.
    const white = spawn(game, "Savannah Lions", B);
    // A Dog: Isamaru's a Dog, white.
    const red = spawn(game, "Grizzly Bears");
    expect(pt(game, host)).toEqual({ power: 4, toughness: 4 });
    expect(pt(game, white).power).toBe(3);
    expect(pt(game, red)).toEqual({ power: 2, toughness: 2 });
  });

  it("attached to nothing does nothing, and it can go only on a legendary creature", () => {
    const { game } = table();
    const banner = spawn(game, "Konda's Banner");
    const lions = spawn(game, "Savannah Lions");
    expect(pt(game, lions).power).toBe(2);
    // Equip can target it, but can't attach it (`attachOnlyTo`).
    lands(game, "Wastes", 2);
    activate(game, banner, 0, { targets: [ref(lions)] });
    settle(game);
    expect(game.state.objects[banner].attachedTo ?? null).toBe(null);
    expect(pt(game, lions).power).toBe(2);
  });

  it("a host shares with itself, and a creature sharing both gets each bonus once", () => {
    const { game } = table();
    const host = spawn(game, "Grizzly Bears");
    const banner = on(game, "Konda's Banner", host);
    // A green Bear: its own color and type, once each.
    expect(pt(game, host)).toEqual({ power: 4, toughness: 4 });
    // A Bear's color only, on another side.
    const sibling = spawn(game, "Llanowar Elves", B);
    expect(pt(game, sibling)).toEqual({ power: 2, toughness: 2 });
    // A second Bear shares both, and still gets each once.
    const bear = spawn(game, "Grizzly Bears", B);
    expect(pt(game, bear)).toEqual({ power: 4, toughness: 4 });
    expect(game.state.objects[banner].attachedTo).toBe(host);
  });

  it("a changeling on the host shares a creature type with any creature that has one", () => {
    const { game } = table();
    const host = spawn(game, "Mirror Entity");
    on(game, "Konda's Banner", host);
    const lions = spawn(game, "Savannah Lions", B);
    // White too: Mirror Entity's a white changeling. Both bonuses.
    expect(pt(game, lions).power).toBe(4);
    const artifact = spawn(game, "Grizzly Bears", B);
    // A creature type alone, green.
    expect(pt(game, artifact).power).toBe(3);
  });
});

describe("So Tiny: the host's controller's graveyard", () => {
  it("-2/-0, then -6/-0 from seven cards, read from whoever controls it now", () => {
    const { game } = table();
    const big = spawn(game, "Craw Wurm", B);
    on(game, "So Tiny", big);
    expect(pt(game, big).power).toBe(4);
    // Seven in Alice's graveyard, the Aura's controller's, aren't the point.
    for (let i = 0; i < 7; i += 1) toGraveyard(game, "Wastes", A);
    expect(pt(game, big).power).toBe(4);
    for (let i = 0; i < 7; i += 1) toGraveyard(game, "Wastes", B);
    expect(pt(game, big).power).toBe(0);
    game.debugApplyEffect(A, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(big)]);
    expect(controller(game, big)).toBe(A);
    expect(pt(game, big).power).toBe(0);
  });
});

describe("Face of Divinity: another Aura on the host", () => {
  it("counts another Aura whoever controls it, and never itself", () => {
    const { game } = table();
    const host = spawn(game, "Grizzly Bears");
    on(game, "Face of Divinity", host);
    expect(pt(game, host).power).toBe(4);
    expect(keywords(game, host).has("lifelink")).toBe(false);
    const other = on(game, "Kjeldoran Pride", host, B);
    expect(keywords(game, host).has("first-strike")).toBe(true);
    expect(keywords(game, host).has("lifelink")).toBe(true);
    destroy(game, other);
    expect(keywords(game, host).has("lifelink")).toBe(false);
  });

  it("an Equipment isn't an Aura", () => {
    const { game } = table();
    const host = spawn(game, "Grizzly Bears");
    on(game, "Face of Divinity", host);
    on(game, "Champion's Helm", host);
    expect(keywords(game, host).has("lifelink")).toBe(false);
  });
});

describe("Favorable Destiny: the host's color and its controller's other creatures", () => {
  it("+1/+2 only on white; shroud only with another creature beside it", () => {
    const { game } = table();
    const white = spawn(game, "Savannah Lions");
    on(game, "Favorable Destiny", white);
    expect(pt(game, white)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, white).has("shroud")).toBe(false);
    const other = spawn(game, "Grizzly Bears");
    expect(keywords(game, white).has("shroud")).toBe(true);
    destroy(game, other);
    expect(keywords(game, white).has("shroud")).toBe(false);

    const green = spawn(game, "Grizzly Bears", B);
    on(game, "Favorable Destiny", green);
    expect(pt(game, green)).toEqual({ power: 2, toughness: 2 });
  });

  it("its controller, not the Aura's: the Aura's own creatures don't count", () => {
    const { game } = table();
    spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Savannah Lions", B);
    on(game, "Favorable Destiny", theirs);
    expect(keywords(game, theirs).has("shroud")).toBe(false);
    spawn(game, "Grizzly Bears", B);
    expect(keywords(game, theirs).has("shroud")).toBe(true);
  });
});

describe("Champion's Helm", () => {
  it("hexproof only on a legendary creature", () => {
    const { game } = table();
    const legend = spawn(game, "Isamaru, Hound of Konda");
    on(game, "Champion's Helm", legend);
    expect(pt(game, legend).power).toBe(4);
    expect(keywords(game, legend).has("hexproof")).toBe(true);
    const plain = spawn(game, "Grizzly Bears");
    on(game, "Champion's Helm", plain);
    expect(keywords(game, plain).has("hexproof")).toBe(false);
  });
});

describe("other than enchanted creature", () => {
  it("Due Diligence: the host can't be its target, and another creature gets the bonus", () => {
    const { game, a } = table();
    lands(game, "Plains", 3);
    const host = spawn(game, "Grizzly Bears");
    const other = spawn(game, "Savannah Lions");
    const third = spawn(game, "Llanowar Elves");
    let offered: readonly unknown[] = [];
    a.chooseTargetsFn = (_view, _source, _specs, legal) => {
      offered = legal[0] ?? [];
      return [ref(other)];
    };
    cast(game, toHand(game, "Due Diligence"), { targets: [ref(host)] });
    settle(game);
    expect(offered).toContainEqual(ref(other));
    expect(offered).toContainEqual(ref(third));
    expect(offered).not.toContainEqual(ref(host));
    expect(pt(game, other)).toEqual({ power: 4, toughness: 3 });
    expect(keywords(game, other).has("vigilance")).toBe(true);
    expect(pt(game, host)).toEqual({ power: 4, toughness: 4 });
  });

  it("Kjeldoran Pride: moves to another creature, not the one it's on", () => {
    const { game } = table();
    lands(game, "Island", 6);
    const host = spawn(game, "Grizzly Bears");
    const other = spawn(game, "Savannah Lions", B);
    const pride = on(game, "Kjeldoran Pride", host);
    expect(() => activate(game, pride, 0, { targets: [ref(host)] })).toThrow();
    activate(game, pride, 0, { targets: [ref(other)] });
    settle(game);
    expect(game.state.objects[pride].attachedTo).toBe(other);
    expect(pt(game, other).toughness).toBe(3);
    expect(pt(game, host).toughness).toBe(2);
  });

  it("Sporogenic Infection: the edict can't take the enchanted creature; damage destroys it", () => {
    const { game, a, b } = table();
    lands(game, "Swamp", 2);
    const host = spawn(game, "Grizzly Bears", B);
    const other = spawn(game, "Savannah Lions", B);
    a.chooseTargetsFn = () => [ref(B)];
    const { offered } = pickPermanents(b, other);
    cast(game, toHand(game, "Sporogenic Infection"), { targets: [ref(host)] });
    settle(game);
    expect(zone(game, other)).toBe("graveyard");
    expect(zone(game, host)).toBe("battlefield");
    expect(offered).not.toContain(host);
    game.debugApplyEffect(A, { kind: "damage", target: 0, amount: 1 }, [ref(host)]);
    settle(game);
    expect(zone(game, host)).toBe("graveyard");
  });

  it("Sporogenic Infection: the enchanted creature alone leaves nothing to sacrifice", () => {
    const { game, a } = table();
    lands(game, "Swamp", 2);
    const host = spawn(game, "Grizzly Bears", B);
    a.chooseTargetsFn = () => [ref(B)];
    cast(game, toHand(game, "Sporogenic Infection"), { targets: [ref(host)] });
    settle(game);
    expect(zone(game, host)).toBe("battlefield");
  });
});

describe("Daybreak Coronet: enchant creature with another Aura attached to it", () => {
  it("needs another Aura to be cast, doesn't count itself, and falls off with it gone", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    const bare = spawn(game, "Savannah Lions");
    expect(() => cast(game, toHand(game, "Daybreak Coronet"), { targets: [ref(bare)] })).toThrow();
    const host = spawn(game, "Grizzly Bears");
    const pride = on(game, "Kjeldoran Pride", host);
    const coronet = toHand(game, "Daybreak Coronet");
    cast(game, coronet, { targets: [ref(host)] });
    settle(game);
    expect(game.state.objects[coronet].attachedTo).toBe(host);
    expect(pt(game, host).power).toBe(6);
    destroy(game, pride);
    game.advanceUntil((s) => s.objects[coronet].zone === "graveyard");
    expect(pt(game, host).power).toBe(2);
  });
});

describe("Bride's Gown and Groom's Finery: a named Equipment on a creature you control", () => {
  it("each lifts the other, on the same creature or two", () => {
    const { game } = table();
    const one = spawn(game, "Grizzly Bears");
    const two = spawn(game, "Savannah Lions");
    on(game, "Bride's Gown", one);
    expect(pt(game, one)).toEqual({ power: 4, toughness: 2 });
    on(game, "Groom's Finery", two);
    expect(pt(game, one)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, one).has("first-strike")).toBe(true);
    expect(pt(game, two)).toEqual({ power: 4, toughness: 3 });
    expect(keywords(game, two).has("deathtouch")).toBe(true);
  });

  it("the partner on a creature someone else controls doesn't count", () => {
    const { game } = table();
    const one = spawn(game, "Grizzly Bears");
    const two = spawn(game, "Savannah Lions", B);
    on(game, "Bride's Gown", one);
    on(game, "Groom's Finery", two);
    expect(pt(game, one).toughness).toBe(2);
  });
});
