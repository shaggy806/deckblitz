/**
 * A reflexive ability's `about` (rule 603.12): "it", "that token" or "that
 * creature" naming something its creating resolution made or targeted, read
 * by the reflexive ability as its trigger object.
 */
import { describe, expect, it } from "vitest";
import type { ObjectId } from "../primitives.js";
import type { GameState } from "../state.js";
import { slotPolarities } from "../target-polarity.js";
import {
  A,
  B,
  cast,
  enter,
  keywords,
  lands,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  zone,
} from "./harness.js";

const reflexiveOnStack = (s: GameState): boolean =>
  s.zones.shared.stack.some((id) => s.objects[id]?.reflexiveTrigger !== undefined);

/** The one token of `name` on the battlefield. */
const tokenNamed = (s: GameState, name: string): ObjectId => {
  const found = Object.keys(s.objects)
    .map((id) => s.objects[id as ObjectId])
    .filter((o) => o.zone === "battlefield" && o.cardName === name);
  expect(found).toHaveLength(1);
  return found[0].id;
};

describe("about: 'created' — the token the resolution made", () => {
  it("Dáin Ironfoot attaches the Axe it created, on a separate ability", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    pickTargets(a, bears);
    enter(game, "Dáin Ironfoot", A, { settle: false });
    game.advanceUntil(reflexiveOnStack);
    const axe = tokenNamed(game.state, "Axe Token");
    // The token is there, unattached, while the ability waits on the stack.
    expect(game.state.objects[axe].attachedTo ?? null).toBeNull();
    settle(game);
    expect(game.state.objects[axe].attachedTo).toBe(bears);
    expect(pt(game, bears).power).toBe(3);
  });

  it("doesn't attach an Axe that left in response, as it's gone (rule 400.7)", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    pickTargets(a, bears);
    enter(game, "Dáin Ironfoot", A, { settle: false });
    game.advanceUntil(reflexiveOnStack);
    const axe = tokenNamed(game.state, "Axe Token");
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Disenchant"), { targets: [ref(axe)] });
    expect(game.state.objects[axe]?.zone ?? "gone").not.toBe("battlefield");
    expect(pt(game, bears).power).toBe(2);
  });

  it("Dáin's attack gives only equipped attackers double strike", () => {
    const { game, a } = table();
    const dain = spawn(game, "Dáin Ironfoot", A, { sick: false });
    const bears = spawn(game, "Grizzly Bears", A, { sick: false });
    const other = spawn(game, "Grizzly Bears", A, { sick: false });
    const axe = spawn(game, "Axe Token", A);
    game.state.objects[axe].attachedTo = bears;
    a.declareAttackersFn = () => [
      { attacker: dain, defender: B },
      { attacker: bears, defender: B },
      { attacker: other, defender: B },
    ];
    game.advanceUntil((s) => s.turn.step === "declare-blockers");
    expect(keywords(game, bears).has("double-strike")).toBe(true);
    expect(keywords(game, other).has("double-strike")).toBe(false);
    expect(keywords(game, dain).has("double-strike")).toBe(false);
  });

  it("Forum Filibuster returns the Equipment attached to the token it made", () => {
    const { game, a } = table();
    spawn(game, "Forum Filibuster", A);
    const equipment = toGraveyard(game, "Bonesplitter", A);
    pickTargets(a, equipment);
    toStep(game, "upkeep");
    game.advanceUntil(reflexiveOnStack);
    settle(game);
    const inkling = tokenNamed(game.state, "Inkling Token");
    expect(zone(game, equipment)).toBe("battlefield");
    expect(game.state.objects[equipment].attachedTo).toBe(inkling);
    expect(pt(game, inkling).power).toBe(4);
  });

  it("Forum Filibuster's 'up to one' can name nothing, and the token stays", () => {
    const { game, a } = table();
    spawn(game, "Forum Filibuster", A);
    const equipment = toGraveyard(game, "Bonesplitter", A);
    pickTargets(a, null);
    toStep(game, "upkeep");
    settle(game);
    expect(pt(game, tokenNamed(game.state, "Inkling Token")).power).toBe(2);
    expect(zone(game, equipment)).toBe("graveyard");
  });
});

describe("about: 'put-this-way' — the card the resolution returned", () => {
  it("Back for More's creature fights the target it then chose", () => {
    const { game, a } = table();
    const back = toGraveyard(game, "Colossal Dreadmaw", A);
    const victim = spawn(game, "Grizzly Bears", B);
    lands(game, "Wastes", 4);
    lands(game, "Swamp", 1);
    lands(game, "Forest", 1);
    pickTargets(a, victim);
    cast(game, toHand(game, "Back for More"), { targets: [ref(back)] });
    expect(zone(game, back)).toBe("battlefield");
    expect(game.state.objects[back].damageMarked ?? 0).toBe(2);
    expect(zone(game, victim)).toBe("graveyard");
  });

  it("an undeclared 'up to one' target means no fight", () => {
    const { game, a } = table();
    const back = toGraveyard(game, "Colossal Dreadmaw", A);
    const bystander = spawn(game, "Grizzly Bears", B);
    lands(game, "Wastes", 4);
    lands(game, "Swamp", 1);
    lands(game, "Forest", 1);
    pickTargets(a, null);
    cast(game, toHand(game, "Back for More"), { targets: [ref(back)] });
    expect(zone(game, back)).toBe("battlefield");
    expect(game.state.objects[back].damageMarked ?? 0).toBe(0);
    expect(zone(game, bystander)).toBe("battlefield");
  });

  it("naming nothing, nothing triggers (rule 603.12)", () => {
    const { game } = table();
    game.debugApplyEffect(A, {
      kind: "reflexive-trigger",
      about: "put-this-way",
      targets: [],
      effect: { kind: "gain-life", amount: 3 },
      text: "When you do, you gain 3 life.",
    }, []);
    expect(game.state.pendingTriggers).toHaveLength(0);
    settle(game);
    expect(game.state.players[A].life).toBe(20);
  });
});

describe("about: a slot — the creating ability's own target", () => {
  it("Curse of the Werefox: that creature fights, with its Role's +1/+1", () => {
    const { game, a } = table();
    const mine = spawn(game, "Grizzly Bears", A);
    const victim = spawn(game, "Grizzly Bears", B);
    lands(game, "Forest", 3);
    pickTargets(a, victim);
    cast(game, toHand(game, "Curse of the Werefox"), { targets: [ref(mine)] });
    // A 2/2 without the Role would have died in this fight.
    expect(zone(game, mine)).toBe("battlefield");
    expect(pt(game, mine).power).toBe(3);
    expect(keywords(game, mine).has("trample")).toBe(true);
    expect(game.state.objects[mine].damageMarked).toBe(2);
    expect(zone(game, victim)).toBe("graveyard");
  });

  it("Behemoth of Vault 0: paying the energy destroys its target, on a separate ability", () => {
    const { game, a } = table();
    const behemoth = enter(game, "Behemoth of Vault 0", A);
    expect(game.state.players[A].energy).toBe(4);
    const victim = spawn(game, "Grizzly Bears", B); // mana value 2
    pickTargets(a, victim);
    pickModes(a, 0);
    lands(game, "Swamp", 2);
    cast(game, toHand(game, "Doom Blade"), { targets: [ref(behemoth)], settle: false });
    game.advanceUntil(reflexiveOnStack);
    // Paid, and the permanent is still there with the ability on the stack.
    expect(game.state.players[A].energy).toBe(2);
    expect(zone(game, victim)).toBe("battlefield");
    settle(game);
    expect(zone(game, victim)).toBe("graveyard");
  });

  it("a bot reads an about slot by what the reflexive ability does to it", () => {
    const { game } = table();
    const dies = game.registry.get("Behemoth of Vault 0").triggered[1];
    expect(slotPolarities(dies.effect, 1)).toEqual(["harm"]);
    const curse = game.registry.get("Curse of the Werefox");
    expect(slotPolarities(curse.effect, 1)).toEqual(["help"]);
  });

  it("Behemoth's reflexive ability leaves alone a permanent that left and came back", () => {
    const { game, a } = table();
    const behemoth = enter(game, "Behemoth of Vault 0", A);
    const victim = spawn(game, "Grizzly Bears", A);
    pickTargets(a, victim);
    pickModes(a, 0);
    lands(game, "Swamp", 2);
    cast(game, toHand(game, "Doom Blade"), { targets: [ref(behemoth)], settle: false });
    game.advanceUntil(reflexiveOnStack);
    // Flickered in response, it's a new object (rule 400.7): the energy is
    // spent and the ability finds nothing to destroy.
    const stint = game.state.objects[victim].zoneChangeCount;
    lands(game, "Plains", 1);
    cast(game, toHand(game, "Cloudshift"), { targets: [ref(victim)] });
    expect(game.state.players[A].energy).toBe(2);
    expect(zone(game, victim)).toBe("battlefield");
    expect(game.state.objects[victim].zoneChangeCount).not.toBe(stint);
  });
});
