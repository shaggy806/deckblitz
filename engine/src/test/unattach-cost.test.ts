/**
 * An unattach as a cost (rule 701.3d, `AbilityCost.unattach`): the Equipment
 * that grants the ability (Leonin Bola, Razor Boomerang), the source itself
 * (Sunforger), or one attached to the source that the player chooses (Captain
 * America). It stays on the battlefield, unattached, and without anything
 * attached the cost can't be paid.
 */
import { describe, expect, it } from "vitest";

import type { Action, LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  activate,
  destroy,
  hand,
  lands,
  life,
  pickFromZone,
  pt,
  ref,
  settle,
  spawn,
  table,
  toLibrary,
  toStep,
  zone,
} from "./harness.js";

const equipTo = (game: Game, equipment: ObjectId, creature: ObjectId): void => {
  game.state.objects[equipment].attachedTo = creature;
};
type Offer = Extract<LegalAction, { kind: "activate-ability" }>;
const offersOf = (game: Game, source: ObjectId): Offer[] =>
  game.legalActions(A).filter((x): x is Offer => x.kind === "activate-ability" && x.source === source);
const attachedTo = (game: Game, id: ObjectId): ObjectId | null => game.state.objects[id].attachedTo;
const unattachedEvents = (game: Game): number =>
  game.state.eventLog.filter((e) => e.type === "permanent-unattached").length;

describe("Leonin Bola — unattach what grants the ability", () => {
  it("pays by unattaching: the Equipment stays, and the ability resolves", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const bola = spawn(game, "Leonin Bola");
    const ogre = spawn(game, "Hill Giant", B);
    equipTo(game, bola, bears);
    const before = unattachedEvents(game);
    activate(game, bears, 0, { targets: [ref(ogre)] });
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(game.state.objects[ogre].tapped).toBe(true);
    expect(zone(game, bola)).toBe("battlefield");
    expect(attachedTo(game, bola)).toBeNull();
    expect(unattachedEvents(game)).toBe(before + 1);
    // Off the creature, it grants nothing.
    expect(offersOf(game, bears)).toHaveLength(0);
  });

  it("is paid before anyone can answer, so it stands when the ability is removed", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const bola = spawn(game, "Leonin Bola");
    const ogre = spawn(game, "Hill Giant", B);
    equipTo(game, bola, bears);
    activate(game, bears, 0, { targets: [ref(ogre)], settle: false });
    expect(attachedTo(game, bola)).toBeNull();
    expect(game.state.zones.shared.stack).toHaveLength(1);
    settle(game);
    expect(game.state.objects[ogre].tapped).toBe(true);
  });

  it("is the creature's controller's to activate, whoever controls the Equipment", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const bola = spawn(game, "Leonin Bola", B);
    const ogre = spawn(game, "Hill Giant", B);
    equipTo(game, bola, bears);
    expect(offersOf(game, bears)).toHaveLength(1);
    activate(game, bears, 0, { targets: [ref(ogre)] });
    expect(game.state.objects[ogre].tapped).toBe(true);
    expect(attachedTo(game, bola)).toBeNull();
    expect(game.state.objects[bola].controller).toBe(B);
  });

  it("still needs the {T}: a tapped creature can't", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", A, { tapped: true });
    const bola = spawn(game, "Leonin Bola");
    spawn(game, "Hill Giant", B);
    equipTo(game, bola, bears);
    expect(offersOf(game, bears)).toHaveLength(0);
    expect(attachedTo(game, bola)).toBe(bears);
  });
});

describe("Razor Boomerang — the unattached granter still acts", () => {
  it("deals the damage itself and goes back to its owner's hand", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const boomerang = spawn(game, "Razor Boomerang");
    equipTo(game, boomerang, bears);
    activate(game, bears, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(19);
    const dealt = game.state.eventLog.filter((e) => e.type === "damage-dealt");
    expect(dealt.at(-1)).toMatchObject({ source: boomerang });
    expect(zone(game, boomerang)).toBe("hand");
    expect(hand(game)).toContain(boomerang);
  });

  it("gone by resolution, it still deals the damage and doesn't come back", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const boomerang = spawn(game, "Razor Boomerang");
    equipTo(game, boomerang, bears);
    activate(game, bears, 0, { targets: [ref(B)], settle: false });
    destroy(game, boomerang);
    settle(game);
    expect(life(game, B)).toBe(19);
    expect(zone(game, boomerang)).toBe("graveyard");
  });

  it("stays out, unattached, when its target has gone", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const boomerang = spawn(game, "Razor Boomerang");
    const victim = spawn(game, "Hill Giant", B);
    equipTo(game, boomerang, bears);
    activate(game, bears, 0, { targets: [ref(victim)], settle: false });
    destroy(game, victim);
    settle(game);
    expect(zone(game, boomerang)).toBe("battlefield");
    expect(attachedTo(game, boomerang)).toBeNull();
  });
});

describe("Sunforger — unattach this Equipment", () => {
  it("can't be activated while it's attached to nothing", () => {
    const { game } = table();
    lands(game, "Plateau", 2);
    const sunforger = spawn(game, "Sunforger");
    expect(offersOf(game, sunforger).filter((o) => o.abilityIndex === 0)).toHaveLength(0);
    expect(() => activate(game, sunforger, 0)).toThrow();
  });

  it("comes off, the bonus with it, and casts the find free", () => {
    const { game, a } = table();
    lands(game, "Plateau", 2);
    const bears = spawn(game, "Grizzly Bears");
    const sunforger = spawn(game, "Sunforger");
    const giant = spawn(game, "Hill Giant", B);
    equipTo(game, sunforger, bears);
    expect(pt(game, bears).power).toBe(6);
    const bolt = toLibrary(game, "Lightning Bolt");
    const found = pickFromZone(a, bolt);
    a.chooseCastNowFn = (_view, offer) => {
      const way = offer.casts.find((c) => c.card === bolt);
      if (way === undefined) return null;
      return { type: "cast-spell", player: A, card: bolt, targets: [ref(giant)], via: way.via, ...(offer.free ? { free: true } : {}) };
    };
    activate(game, sunforger, 0);
    expect(found.offered).toContain(bolt);
    expect(attachedTo(game, sunforger)).toBeNull();
    expect(pt(game, bears).power).toBe(2);
    expect(zone(game, bolt)).toBe("graveyard");
    expect(zone(game, giant)).toBe("graveyard");
  });

  it("finds only a red or white instant of mana value 4 or less", () => {
    const { game, a } = table();
    lands(game, "Plateau", 2);
    const bears = spawn(game, "Grizzly Bears");
    const sunforger = spawn(game, "Sunforger");
    equipTo(game, sunforger, bears);
    const bolt = toLibrary(game, "Lightning Bolt");
    const path = toLibrary(game, "Swords to Plowshares");
    const counterspell = toLibrary(game, "Counterspell");
    const fireball = toLibrary(game, "Fireball");
    const found = pickFromZone(a);
    activate(game, sunforger, 0);
    expect(found.offered).toContain(bolt);
    expect(found.offered).toContain(path);
    expect(found.offered).not.toContain(counterspell);
    expect(found.offered).not.toContain(fireball);
  });
});

describe("Captain America — unattach the Equipment you choose", () => {
  /** Captain America with a Bonesplitter (1) and a Vulshok Morningstar (2). */
  const armed = (game: Game): { cap: ObjectId; one: ObjectId; two: ObjectId } => {
    lands(game, "Wastes", 3);
    const cap = spawn(game, "Captain America, First Avenger");
    const one = spawn(game, "Bonesplitter");
    const two = spawn(game, "Vulshok Morningstar");
    equipTo(game, one, cap);
    equipTo(game, two, cap);
    return { cap, one, two };
  };
  const thrown = (
    source: ObjectId,
    sacrifice: ObjectId,
    targets: readonly ObjectId[] | readonly string[],
    division?: readonly number[],
  ): Action =>
    ({
      type: "activate-ability",
      player: A,
      source,
      abilityIndex: 0,
      sacrifice,
      targets: (targets as readonly never[]).map((t) => ref(t)),
      ...(division !== undefined ? { division } : {}),
    }) as Action;

  it("needs something attached to it", () => {
    const { game } = table();
    lands(game, "Wastes", 3);
    const cap = spawn(game, "Captain America, First Avenger");
    expect(offersOf(game, cap)).toHaveLength(0);
    // On another creature, it's not attached to him.
    const bears = spawn(game, "Grizzly Bears");
    const onBears = spawn(game, "Bonesplitter");
    equipTo(game, onBears, bears);
    expect(offersOf(game, cap)).toHaveLength(0);
  });

  it("offers one activation per total, each with what pays it", () => {
    const { game } = table();
    const { cap, one, two } = armed(game);
    const offers = offersOf(game, cap);
    expect(offers.map((o) => [o.divide?.total, o.sacrifice?.choices, o.sacrifice?.unattach])).toEqual([
      [1, [one], true],
      [2, [two], true],
    ]);
  });

  it("groups Equipment of one mana value for the player to choose between", () => {
    const { game } = table();
    lands(game, "Wastes", 3);
    const cap = spawn(game, "Captain America, First Avenger");
    const first = spawn(game, "Bonesplitter");
    const second = spawn(game, "Bonesplitter");
    equipTo(game, first, cap);
    equipTo(game, second, cap);
    expect(offersOf(game, cap).map((o) => o.sacrifice?.choices)).toEqual([[first, second]]);
  });

  it("offers nothing for an Equipment of mana value 0: no target could receive any", () => {
    const { game } = table();
    lands(game, "Wastes", 3);
    const cap = spawn(game, "Captain America, First Avenger");
    const free = spawn(game, "Accorder's Shield");
    equipTo(game, free, cap);
    expect(offersOf(game, cap)).toHaveLength(0);
  });

  it("divides that Equipment's mana value, unattaching only it", () => {
    const { game } = table();
    const { cap, one, two } = armed(game);
    const goblin = spawn(game, "Hill Giant", B);
    const before = life(game, B);
    game.dispatch(thrown(cap, two, [B, goblin] as never, [1, 1]));
    settle(game);
    expect(attachedTo(game, two)).toBeNull();
    expect(zone(game, two)).toBe("battlefield");
    expect(attachedTo(game, one)).toBe(cap);
    expect(life(game, B)).toBe(before - 1);
    expect(game.state.objects[goblin].damageMarked).toBe(1);
  });

  it("refuses a division that isn't that Equipment's mana value", () => {
    const { game } = table();
    const { cap, one, two } = armed(game);
    const goblin = spawn(game, "Hill Giant", B);
    expect(() => game.dispatch(thrown(cap, one, [B, goblin] as never, [1, 1]))).toThrow();
    expect(attachedTo(game, one)).toBe(cap);
    expect(attachedTo(game, two)).toBe(cap);
  });

  it("refuses an Equipment that isn't on him", () => {
    const { game } = table();
    const { cap } = armed(game);
    const elsewhere = spawn(game, "Bonesplitter");
    expect(() => game.dispatch(thrown(cap, elsewhere, [B] as never))).toThrow();
  });

  it("catches it at the beginning of combat", () => {
    const { game, a } = table();
    const { cap, two } = armed(game);
    game.dispatch(thrown(cap, two, [B] as never, [2]));
    settle(game);
    expect(life(game, B)).toBe(18);
    expect(attachedTo(game, two)).toBeNull();
    a.chooseTargetsFn = () => [ref(two)];
    toStep(game, "begin-combat");
    settle(game);
    expect(attachedTo(game, two)).toBe(cap);
  });
});
